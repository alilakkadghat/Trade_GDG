"""
Cross-document validator — compares extracted fields across all documents
in a transaction and flags discrepancies.
"""
from backend.services.storage import db_select, db_insert, db_delete

CROSS_CHECK_RULES = [
    {"field": "Consignee Name", "keys": ["consignee_name", "buyer_name", "beneficiary_name", "consignee"], "severity": "Critical",
     "suggestion_template": "Consignee name on {doc1} ('{val1}') differs from {doc2} ('{val2}'). Amend the incorrect document before LC presentation."},
    {"field": "HS Code", "keys": ["hs_code"], "severity": "Critical",
     "suggestion_template": "HS Code mismatch: {doc1} shows '{val1}' but {doc2} shows '{val2}'. Incorrect HS codes cause customs holds."},
    {"field": "Total Value / Amount", "keys": ["total_value", "amount", "value"], "severity": "Critical",
     "suggestion_template": "Value mismatch: {doc1} shows '{val1}' but {doc2} shows '{val2}'. LC discrepancy will block payment."},
    {"field": "Currency", "keys": ["currency"], "severity": "Critical",
     "suggestion_template": "Currency mismatch: {doc1} shows '{val1}' but {doc2} shows '{val2}'."},
    {"field": "Port of Loading", "keys": ["port_of_loading"], "severity": "Warning",
     "suggestion_template": "Port of loading differs: {doc1} shows '{val1}', {doc2} shows '{val2}'."},
    {"field": "Port of Discharge", "keys": ["port_of_discharge"], "severity": "Warning",
     "suggestion_template": "Port of discharge differs: {doc1} shows '{val1}', {doc2} shows '{val2}'."},
    {"field": "Gross Weight", "keys": ["gross_weight"], "severity": "Warning",
     "suggestion_template": "Weight mismatch: {doc1} shows '{val1}', {doc2} shows '{val2}'."},
    {"field": "Number of Packages", "keys": ["number_of_packages"], "severity": "Warning",
     "suggestion_template": "Package count differs: {doc1} shows '{val1}', {doc2} shows '{val2}'."},
    {"field": "Incoterms", "keys": ["incoterms"], "severity": "Warning",
     "suggestion_template": "Incoterms mismatch: {doc1} shows '{val1}', {doc2} shows '{val2}'."},
    {"field": "Description of Goods", "keys": ["description_of_goods"], "severity": "Warning",
     "suggestion_template": "Goods description differs between {doc1} and {doc2}. Ensure descriptions match LC terms exactly."},
]


import re
import difflib

def _normalize(val: str | None) -> str:
    if not val:
        return ""
    v = val.lower().strip()
    
    # Normalize common units and abbreviations
    replacements = {
        r'\bkgs\b': 'kg',
        r'\bkilos\b': 'kg',
        r'\bctns\b': 'cartons',
        r'\bplt\b': 'pallets',
        r'\bplts\b': 'pallets',
        r'\bstd\b': 'standard',
        r'\bq-size\b': 'queensize',
        r'\bqueen size\b': 'queensize',
        r'\bpcs\b': 'pieces',
    }
    for pat, repl in replacements.items():
        v = re.sub(pat, repl, v)
    
    # Remove all non-alphanumeric chars for robust comparison
    return re.sub(r'[^a-z0-9]', '', v)


def _is_match(val1: str, val2: str, field_name: str) -> bool:
    norm1 = _normalize(val1)
    norm2 = _normalize(val2)
    if norm1 == norm2:
        return True
    
    # For long text fields like Description of Goods, use fuzzy matching (80% similarity)
    if field_name == "Description of Goods" or len(norm1) > 20:
        ratio = difflib.SequenceMatcher(None, norm1, norm2).ratio()
        if ratio > 0.8:
            return True
            
    return False


def _get_field_value(fields: list[dict], keys: list[str]) -> str | None:
    for f in fields:
        if f.get("field_name") in keys and f.get("field_value"):
            return f["field_value"]
    return None


def validate_transaction(transaction_id: str) -> list[dict]:
    """Run cross-document validation on all documents in a transaction."""
    db_delete("validation_results", {"transaction_id": transaction_id})

    docs = db_select("documents", {"transaction_id": transaction_id})
    if len(docs) < 2:
        return []

    doc_fields = {}
    for doc in docs:
        fields = db_select("extracted_fields", {"document_id": doc["id"]})
        doc_fields[doc["id"]] = {
            "name": doc.get("document_type") or doc.get("original_filename", "Unknown"),
            "fields": fields,
        }

    results = []
    doc_ids = list(doc_fields.keys())

    for rule in CROSS_CHECK_RULES:
        values_by_doc = []
        for did in doc_ids:
            val = _get_field_value(doc_fields[did]["fields"], rule["keys"])
            if val:
                values_by_doc.append((did, doc_fields[did]["name"], val))

        if len(values_by_doc) < 2:
            continue

        ref_id, ref_name, ref_val = values_by_doc[0]
        for _, other_name, other_val in values_by_doc[1:]:
            if _is_match(ref_val, other_val, rule["field"]):
                result = {"transaction_id": transaction_id, "status": "OK", "field": rule["field"],
                          "document_name": other_name, "expected_value": ref_val, "extracted_value": other_val,
                          "severity": "Info", "suggestion": "Validated — values match."}
            else:
                result = {"transaction_id": transaction_id, "status": "MISMATCH", "field": rule["field"],
                          "document_name": other_name, "expected_value": ref_val, "extracted_value": other_val,
                          "severity": rule["severity"],
                          "suggestion": rule["suggestion_template"].format(doc1=ref_name, val1=ref_val, doc2=other_name, val2=other_val)}

            db_insert("validation_results", result)
            results.append(result)

    return results
