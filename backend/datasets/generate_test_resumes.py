import os
import pymupdf
import docx

def create_pdf(file_path: str, content: str):
    doc = pymupdf.open()
    page = doc.new_page()
    # Insert text into page
    rect = pymupdf.Rect(50, 50, 550, 800)
    page.insert_textbox(rect, content, fontsize=11, fontname="helv")
    doc.save(file_path)
    doc.close()
    print(f"Created PDF: {file_path}")

def create_docx(file_path: str, title: str, sections: list):
    doc = docx.Document()
    doc.add_heading(title, 0)
    for heading, text in sections:
        doc.add_heading(heading, level=1)
        doc.add_paragraph(text)
    doc.save(file_path)
    print(f"Created DOCX: {file_path}")

def main():
    target_dir = os.path.join(os.path.dirname(__file__), "sample_resumes")
    os.makedirs(target_dir, exist_ok=True)

    # 1. Full Stack Developer (PDF)
    fullstack_text = """ALEX CHEN
San Francisco, CA | alex.chen@example.com | (555) 234-5678 | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Passionate Full Stack Web Developer with 2+ years of experience engineering high-performance web applications, responsive user interfaces in React.js, and scalable RESTful backends using Node.js and MongoDB.

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frontend Technologies: React.js, Redux, Tailwind CSS, Bootstrap, Responsive Design
Backend & APIs: Node.js, Express.js, REST API, WebSockets
Databases & Storage: MongoDB, PostgreSQL, Redis
DevOps & Tools: Git, Docker, GitHub Actions, Postman, Vite

WORK EXPERIENCE
Full Stack Software Engineer | TechPulse Solutions (2024 - Present)
- Engineered responsive React.js dashboards with Tailwind CSS serving 50,000+ monthly active users.
- Designed secure Node.js microservices with JWT authentication and MongoDB schemas.
- Built automated CI/CD deployment pipelines utilizing Docker and GitHub Actions.

EDUCATION
Bachelor of Science in Computer Science | University of California (2020 - 2024)
"""
    create_pdf(os.path.join(target_dir, "synthetic_fullstack_dev.pdf"), fullstack_text)

    # 2. Python Backend Developer (DOCX)
    python_dev_sections = [
        ("Contact", "PRIYA SHARMA | priya.sharma@example.com | (555) 987-6543 | linkedin.com/in/priyasharma"),
        ("Professional Summary", "Backend Software Engineer specializing in Python, FastAPI, relational database optimization with PostgreSQL, and microservice architectures."),
        ("Technical Skills", "Python, FastAPI, Django, REST API, PostgreSQL, MySQL, Redis, Git, PyTest, Linux, Docker"),
        ("Experience", "Backend Developer at CloudScale Inc (2023 - Present)\n- Developed 15+ RESTful endpoints in FastAPI with Pydantic validation and asynchronous database sessions.\n- Authored comprehensive test suites using PyTest achieving 92% code coverage.\n- Optimized complex PostgreSQL queries and indexing strategies, reducing query latency by 40%."),
        ("Education", "B.Tech in Information Technology | State Technical University (2019 - 2023)")
    ]
    create_docx(os.path.join(target_dir, "synthetic_python_dev.docx"), "PRIYA SHARMA - RESUME", python_dev_sections)

    # 3. Data Analyst (PDF)
    data_analyst_text = """SARAH JENNINGS
Chicago, IL | sarah.j@example.com | (555) 345-6789

PROFESSIONAL SUMMARY
Detail-oriented Data Analyst with expertise in quantitative data analysis, advanced SQL, exploratory data analysis using Python, Pandas, and interactive dashboards.

CORE COMPETENCIES
- Data Analysis & Modeling: SQL, Python, Pandas, NumPy, Scikit-Learn
- Visualization & BI: Data Visualization, Matplotlib, Seaborn, Tableau, Power BI
- Databases: PostgreSQL, MySQL, SQLite
- Collaboration & Version Control: Git, Jupyter Notebooks

WORK EXPERIENCE
Junior Data Analyst | RetailMetric Group (2023 - Present)
- Extracted and cleaned multi-million row datasets using advanced SQL window functions and joins.
- Built automated predictive models with Scikit-Learn and Pandas for customer churn estimation.
- Designed executive dashboards delivering real-time sales and inventory insights.

EDUCATION
Bachelor of Science in Statistics and Data Science | University of Michigan
"""
    create_pdf(os.path.join(target_dir, "synthetic_data_analyst.pdf"), data_analyst_text)

    # 4. Resume with no technical skills (PDF)
    no_skills_text = """JOHN DOE
Marketing Coordinator | customer relations | administrative support
Experience in customer service, sales calls, filing, and office management.
Seeking a transition into technical roles.
"""
    create_pdf(os.path.join(target_dir, "synthetic_no_skills.pdf"), no_skills_text)

    # 5. Empty PDF (PDF)
    empty_doc = pymupdf.open()
    empty_doc.new_page()
    empty_path = os.path.join(target_dir, "synthetic_empty.pdf")
    empty_doc.save(empty_path)
    empty_doc.close()
    print(f"Created Empty PDF: {empty_path}")

if __name__ == "__main__":
    main()
