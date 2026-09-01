import express from  "express"
import cors from "cors"

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/health", (req,res) => res.json({success:true, message:"respose successful" }))

export default app;

