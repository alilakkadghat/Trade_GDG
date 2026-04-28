"""
Document analyzer — uses Gemini to classify and extract structured fields in a single prompt.
"""
import json
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

COMBINED_PROMPT = """You are a trade document intelligence assistant.
Analyze the provided document text and perform two tasks:

1. CLASSIFY the document into EXACTLY ONE of the following types:
   - Bill of Lading
   - Commercial Invoice
   - Letter of Credit
   - Packing List
   - Certificate of Origin
   - Phytosanitary Certificate
   - Insurance Certificate
   - Export Declaration
   - Other

2. EXTRACT the relevant fields based on the classified document type. 
   If a field is not found in the document, use null.

Here are the specific fields to extract for each document type:

- Bill of Lading: bl_number, date, shipper_name, shipper_address, consignee_name, consignee_address, notify_party, vessel_name, voyage_number, port_of_loading, port_of_discharge, place_of_delivery, container_numbers, seal_numbers, description_of_goods, hs_code, gross_weight, net_weight, number_of_packages, freight_terms, incoterms
- Commercial Invoice: invoice_number, date, seller_name, seller_address, buyer_name, buyer_address, description_of_goods, hs_code, quantity, unit_price, total_value, currency, incoterms, country_of_origin, payment_terms, port_of_loading, port_of_discharge
- Letter of Credit: lc_number, date_of_issue, expiry_date, issuing_bank, advising_bank, beneficiary_name, applicant_name, amount, currency, port_of_loading, port_of_discharge, latest_shipment_date, partial_shipment, transhipment, description_of_goods, incoterms
- Packing List: reference_number, date, shipper, consignee, description_of_goods, marks_and_numbers, number_of_packages, gross_weight, net_weight, dimensions, container_number, hs_code
- Certificate of Origin: certificate_number, date, exporter_name, exporter_address, consignee_name, consignee_address, country_of_origin, description_of_goods, hs_code, gross_weight, number_of_packages, certifying_authority
- For any other document type, extract all key fields such as parties, dates, amounts, ports, goods description, HS codes, weights, references. Use descriptive snake_case keys.

Respond ONLY with a valid JSON object in this exact structure, with no markdown formatting or fences:
{{
  "document_type": "The classified document type",
  "fields": {{
    "field_name_1": "value",
    "field_name_2": null
  }}
}}

Document text:
{text}"""

def analyze_document(text: str) -> dict:
    """Classify document and extract fields in a single Gemini call."""
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.0,
    )

    full_prompt = COMBINED_PROMPT.format(text=text[:6000])

    response = llm.invoke(full_prompt)
    content = response.content
    if isinstance(content, str):
        raw = content.strip()
    elif isinstance(content, list):
        raw = "".join(part.get("text", "") if isinstance(part, dict) else str(part) for part in content).strip()
    else:
        raw = str(content).strip()

    # Clean markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()
    if raw.startswith("json"):
        raw = raw[4:].strip()

    try:
        data = json.loads(raw)
        doc_type = data.get("document_type", "Other")
        extracted_fields_dict = data.get("fields", {})
        
        # Format fields as expected by the pipeline
        fields = []
        for key, value in extracted_fields_dict.items():
            if value is not None and value != "":
                fields.append({"field_name": key, "value": str(value), "confidence": 0.95})
            else:
                fields.append({"field_name": key, "value": None, "confidence": 0.0})
                
        return {
            "document_type": doc_type,
            "fields": fields
        }
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from Gemini response: {raw}")
        return {
            "document_type": "Other",
            "fields": [{"field_name": "raw_extraction", "value": raw, "confidence": 0.3}]
        }
