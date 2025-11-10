# RAGForge

RAGForge is a modular Python library that simplifies building Retrieval-Augmented Generation (RAG) pipelines for AI applications. It streamlines integrations with Vertex AI, OpenAI, and ChromaDB, enabling clean, efficient AI logic without complex prompt engineering or messy code.

## Features
- **Modular Design**: Build RAG pipelines with reusable components for retrieval, augmentation, and generation.
- **Seamless Integrations**: Native support for Vertex AI (Google), OpenAI APIs, and ChromaDB vector store.
- **Prompt-Free Simplicity**: Abstract away cumbersome prompts; focus on core logic.
- **Scalable & Reliable**: Handles large-scale generative systems with error reduction and easy debugging.

## Installation
```bash
pip install ragforge
```
*Requires Python 3.8+. Install optional dependencies for specific backends:*
- `pip install google-cloud-aiplatform` for Vertex AI
- `pip install openai` for OpenAI
- `pip install chromadb` for ChromaDB

Set environment variables:
- `OPENAI_API_KEY=your_key` (for OpenAI)
- `GOOGLE_APPLICATION_CREDENTIALS=path_to_service_account.json` (for Vertex AI)

## Quick Start
1. **Initialize Components**:
   ```python
   from ragforge import RAGPipeline, OpenAIEmbedder, ChromaRetriever, VertexGenerator

   embedder = OpenAIEmbedder()
   retriever = ChromaRetriever(collection_name="docs")
   generator = VertexGenerator(model="gemini-pro")
   ```

2. **Build Pipeline**:
   ```python
   pipeline = RAGPipeline(embedder=embedder, retriever=retriever, generator=generator)
   ```

3. **Index Documents**:
   ```python
   docs = ["Sample document text 1", "Sample document text 2"]
   pipeline.index_documents(docs)
   ```

4. **Query**:
   ```python
   response = pipeline.query("What is RAG?")
   print(response)  # Augmented generation output
   ```

## Architecture
- **Embedder**: Converts text to vectors (OpenAI/Vertex).
- **Retriever**: Searches vector store (ChromaDB).
- **Generator**: Produces responses with retrieved context (OpenAI/Vertex).

Supports custom components for extensibility.

## Usage Examples
See [examples/](examples/) for advanced RAG setups, like multi-modal retrieval or hybrid search.

## Contributing
Fork, branch, PR. Follow PEP 8. Tests: `pytest`.

## License
MIT License. See [LICENSE](LICENSE).
