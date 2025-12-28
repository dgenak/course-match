from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer

# -----------------------
# App & CORS
# -----------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # μόνο για development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# NLP Model
# -----------------------
model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

# -----------------------
# Utils
# -----------------------
def extract_keywords(text: str, top_k: int = 12) -> set:
    """
    Επιστρέφει keywords / key-phrases με TF-IDF
    """
    if not text.strip():
        return set()

    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        max_features=top_k
    )
    vectorizer.fit([text])
    return set(vectorizer.get_feature_names_out())

# -----------------------
# Schemas
# -----------------------
class Course(BaseModel):
    title: str
    description: str
    learning_outcomes: str

class CompareRequest(BaseModel):
    base_course: Course
    other_course: Course

# -----------------------
# API Endpoint
# -----------------------
@app.post("/compare")
def compare_courses(req: CompareRequest):
    # --- Embeddings ---
    emb_desc_A = model.encode(req.base_course.description, convert_to_tensor=True)
    emb_desc_B = model.encode(req.other_course.description, convert_to_tensor=True)

    emb_out_A = model.encode(req.base_course.learning_outcomes, convert_to_tensor=True)
    emb_out_B = model.encode(req.other_course.learning_outcomes, convert_to_tensor=True)

    emb_title_A = model.encode(req.base_course.title, convert_to_tensor=True)
    emb_title_B = model.encode(req.other_course.title, convert_to_tensor=True)

    # --- Similarities ---
    sim_desc = util.cos_sim(emb_desc_A, emb_desc_B).item()
    sim_out = util.cos_sim(emb_out_A, emb_out_B).item()
    sim_title = util.cos_sim(emb_title_A, emb_title_B).item()

    # --- Final weighted similarity ---
    final_similarity = (
        0.5 * sim_desc +
        0.4 * sim_out +
        0.1 * sim_title
    )

    # --- Keyword analysis ---
    text_A = req.base_course.description + " " + req.base_course.learning_outcomes
    text_B = req.other_course.description + " " + req.other_course.learning_outcomes

    keywords_A = extract_keywords(text_A, top_k=12)
    keywords_B = extract_keywords(text_B, top_k=12)

    common_topics = sorted(list(keywords_A & keywords_B))
    missing_from_B = sorted(list(keywords_A - keywords_B))

    # --- Response ---
    return {
        "similarity": round(final_similarity * 100, 2),
        "details": {
            "description": round(sim_desc * 100, 2),
            "learning_outcomes": round(sim_out * 100, 2),
            "title": round(sim_title * 100, 2),
        },
        "analysis": {
            "common_topics": common_topics,
            "missing_from_B": missing_from_B
        }
    }
