import PyPDF2
import os

def extract_pdf(pdf_path, output_path):
    try:
        reader = PyPDF2.PdfReader(pdf_path)
        content = ""
        for i, page in enumerate(reader.pages):
            content += f"--- Page {i+1} ---\n"
            content += page.extract_text()
            content += "\n\n"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Successfully extracted text to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    extract_pdf('50SMA_Strategy_Document.pdf', 'extracted_strategy.txt')
