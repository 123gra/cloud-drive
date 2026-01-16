import express, { Request, Response } from "express";
import cors from "cors";
import { supabase } from "./lib/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    if (error) {
      return res.status(500).json({
        status: "error",
        message: error.message
      });
    }

    res.json({
      status: "db ok",
      usersChecked: data.users.length
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Supabase admin fetch failed"
    });
  }
});

export default app;
