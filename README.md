1)
Άνοιξε PowerShell και γράψε:

cd C:\
git clone https://github.com/USERNAME/REPO.git
cd COURSE-MATCH

2)
Τρέξε το NLP Service (Python)

cd C:\COURSE-MATCH\nlp-service
.\.venv\Scripts\Activate.ps1
uvicorn app:app --reload

➡️ Μην το κλείσεις
➡️ Αν δεις:
Uvicorn running on http://127.0.0.1:8000
είσαι ΟΚ.

3)
Τρέξε το Backend (Spring Boot)

Άνοιξε δεύτερο PowerShell και γράψε:

cd C:\COURSE-MATCH\backend
.\mvnw spring-boot:run


➡️ Περίμενε να τελειώσει το startup.

4)Άνοιξε browser και πήγαινε:

http://localhost:8080
