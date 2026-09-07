import { PROJECTS } from "./projects";

export const links = {
  github: "https://github.com/harshalJK",
  linkedin: "https://www.linkedin.com/in/harshal-jorwekar.com",
  resume: "https://in.docworkspace.com/d/sIATGloGMAcKP_MQG?sa=601.1037",
};
const caseStudies = {
  venus: {
    problem:
      "Dynamic gestures change over time, and a single sensor can lose useful information. The system combines RGB video, simulated depth, and EMG.",
    contribution:
      "Designed the multi-stream architecture, built training and inference pipelines, and implemented the ensemble and decision-fusion layers.",
    approach:
      "Modality-specific streams use residual blocks, normalization, and dropout. An ensemble of 34 one-vs-rest classifiers uses priority-based fusion to combine predictions.",
    result:
      "The implementation includes synchronized inputs, temporal windows, mixed-precision training, and post-processing for stable predictions. Published accuracy and latency claims await supporting benchmark artifacts in this case study.",
  },
  mars: {
    problem:
      "Medical records need controlled access and a verifiable history without putting large, sensitive files directly on a ledger.",
    contribution:
      "Designed the architecture, implemented chaincode, integrated IPFS storage, and set up the development network and delivery workflow.",
    approach:
      "Hyperledger Fabric stores metadata and content hashes. Encrypted files live in IPFS, while smart contracts validate identities, roles, consent, and revocation.",
    result:
      "The project separates file storage from authorization and audit events. SHA-256 and ECDSA support content integrity and identity; no regulatory certification or unverified performance result is claimed here.",
  },
  jupiter: {
    problem:
      "A portfolio should make the work easy to read while leaving room for an expressive, interactive experience.",
    contribution:
      "Built the scene, custom Sun and Earth shaders, reusable planet components, orbital motion, navigation, and project presentation.",
    approach:
      "React Three Fiber renders one shared scene. Reusable planet systems carry textured surfaces, rings, and orbiting skill cubes; HTML provides accessible navigation and project details.",
    result:
      "The portfolio combines a real-time solar system with a guided route and free exploration. The original Sun, all eight planets, Earth effects, textures, and project mappings remain part of the experience.",
  },
  saturn: {
    problem:
      "A music recommendation should reflect the mood of the moment as well as a listener’s existing taste.",
    contribution:
      "Developed prompt-to-mood modeling, hybrid ranking, Spotify integration, the interface, and an evaluation workflow.",
    approach:
      "Natural-language prompts map to a valence–arousal space. Audio-feature similarity and a taste profile rank candidate tracks, with diversity filtering and OAuth-based playlist export.",
    result:
      "The project supports mood prompts, playlist building, and personalized ranking. The original description’s pilot preference percentages were explicitly illustrative and are not presented as measured outcomes.",
  },
  uranus: {
    problem:
      "Useful answers disappear into Discord chat history, making repeated questions hard to resolve consistently.",
    contribution:
      "Designed the relational schema and permissions, implemented bot commands, built fuzzy search, and added analytics and delivery tooling.",
    approach:
      "An asynchronous Discord bot connects to a service and repository layer. The database stores questions, answers, tags, and audit history, with indexed fuzzy matching and role-based editing.",
    result:
      "The bot provides persistent teach, ask, edit, and link workflows. Illustrative server-size and response-time examples are excluded until real usage evidence is available.",
  },
};
export const work = [
  {
    id: "mercury",
    name: "SANSKRITA",
    category: "Language models · Retrieval",
    summary:
      "Bringing source-grounded answers to Sanskrit. A retrieval-augmented language model built for a language with limited training data.",
    problem:
      "IAST-transliterated Sanskrit has limited training data and flexible word order. Answers need grounding in primary texts.",
    contribution:
      "Built the pipeline end to end: corpus preparation, a custom tokenizer, GPT-2 fine-tuning, retrieval, evaluation, and integration.",
    approach:
      "SentenceTransformers embeddings and a FAISS index retrieve relevant passages before generation. The answers point back to classical source texts, including the Bhagavad Gita.",
    result:
      "The project combines retrieval, generation, and source citations. Evaluation uses ROUGE and embedding-based cosine similarity; validated benchmark scores are not yet included in this case study.",
  },
  {
    id: "venus",
    name: "Dynamic hand gesture recognition",
    category: "Computer vision · Multimodal ML",
    summary:
      "Combining RGB, simulated depth, and EMG in a multi-stream gesture recognition pipeline.",
  },
  {
    id: "mars",
    name: "Medical records on blockchain",
    category: "Distributed systems · Security",
    summary:
      "Permissioned records with on-chain metadata, encrypted IPFS files, and consent-driven access.",
  },
  {
    id: "jupiter",
    name: "Space portfolio",
    category: "Creative engineering · WebGL",
    summary:
      "This interactive solar system: custom shaders, orbital motion, and a navigable 3D environment.",
  },
  {
    id: "saturn",
    name: "SpotRec",
    category: "Recommendations · NLP",
    summary:
      "A mood-aware music recommender that combines audio features with a personal taste profile.",
  },
  {
    id: "uranus",
    name: "GuildDB",
    category: "Databases · Knowledge tools",
    summary:
      "A Discord knowledge bot with persistent Q&A, fuzzy search, and role-based permissions.",
  },
].map((item) => ({
  ...item,
  ...caseStudies[item.id],
  tech: PROJECTS[item.id].tech,
}));
