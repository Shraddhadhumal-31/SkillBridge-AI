import re
import os
from typing import Dict, Any, Optional
import pymupdf  # PyMuPDF
import docx

class ResumeParser:
    """
    Module 1: Resume Parser
    Extracts, normalizes, and cleans text from PDF and DOCX documents.
    Extracts structural sections (education, experience, contact).
    """

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract plain text from a PDF file using PyMuPDF."""
        try:
            doc = pymupdf.open(file_path)
            extracted_pages = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                if text:
                    extracted_pages.append(text)
            doc.close()
            return "\n".join(extracted_pages)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF file: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract plain text from a DOCX file using python-docx."""
        try:
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    for cell in row.cells:
                        if cell.text.strip():
                            paragraphs.append(cell.text.strip())
            return "\n".join(paragraphs)
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX file: {str(e)}")

    @classmethod
    def clean_text(cls, raw_text: str) -> str:
        """Clean unnecessary whitespace, normalize linebreaks and unicode characters."""
        if not raw_text:
            return ""
        # Replace non-breaking spaces and irregular characters
        text = raw_text.replace("\xa0", " ").replace("\r\n", "\n").replace("\r", "\n")
        # Replace repeated tabs and spaces with a single space
        text = re.sub(r"[ \t]+", " ", text)
        # Collapse excessive newlines to double newlines
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    @classmethod
    def extract_contact_info(cls, text: str) -> Dict[str, Optional[str]]:
        """Extract email, phone, and potential links from resume text."""
        email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
        phone_pattern = r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
        linkedin_pattern = r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+"
        github_pattern = r"(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+"

        email_match = re.search(email_pattern, text)
        phone_match = re.search(phone_pattern, text)
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        github_match = re.search(github_pattern, text, re.IGNORECASE)

        return {
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
            "linkedin": linkedin_match.group(0) if linkedin_match else None,
            "github": github_match.group(0) if github_match else None,
        }

    @classmethod
    def extract_sections(cls, text: str) -> Dict[str, str]:
        """Detect common sections like Education, Experience, Projects."""
        sections = {"education": "", "experience": "", "projects": "", "summary": ""}
        patterns = {
            "education": r"(?i)(education|academic background|qualifications)",
            "experience": r"(?i)(experience|work experience|employment history|internships?)",
            "projects": r"(?i)(projects|academic projects|technical projects)",
            "summary": r"(?i)(summary|professional summary|objective|profile)",
        }
        lines = text.split("\n")
        current_section = None
        section_lines = {k: [] for k in sections}

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue
            matched = False
            for sec, pat in patterns.items():
                if re.match(pat, trimmed) and len(trimmed) < 40:
                    current_section = sec
                    matched = True
                    break
            if not matched and current_section:
                section_lines[current_section].append(trimmed)

        for sec in sections:
            sections[sec] = "\n".join(section_lines[sec][:10])  # limit preview
        return sections

    @classmethod
    def parse(cls, file_path: str) -> Dict[str, Any]:
        """
        Master parse method.
        Validates file existence, format, extracts text, cleans it,
        and generates summary metadata.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        file_size = os.path.getsize(file_path)
        if file_size == 0:
            raise ValueError("The uploaded resume file is empty (0 bytes).")

        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            raw_text = cls.extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            raw_text = cls.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format '{ext}'. Only PDF and DOCX files are supported.")

        cleaned_text = cls.clean_text(raw_text)
        if not cleaned_text:
            raise ValueError("Could not extract any readable text from this document. It may be an image scan or corrupted file.")

        contact_info = cls.extract_contact_info(cleaned_text)
        sections = cls.extract_sections(cleaned_text)

        # Generate a concise preview (first 400 characters)
        preview = cleaned_text[:400] + ("..." if len(cleaned_text) > 400 else "")

        return {
            "raw_text": cleaned_text,
            "preview": preview,
            "char_count": len(cleaned_text),
            "word_count": len(cleaned_text.split()),
            "contact_info": contact_info,
            "sections": sections,
            "file_size": file_size,
        }
