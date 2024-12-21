import { model, Schema } from "mongoose";
const songSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  links: {
    deezer: String,
    tidal: String,
    boom: String,
    youtube: String,
    spotify: String,
    itunes: String,
    amazon: String,
  },
  posterImage: {
    type: String,
    required: true,
  },
});

export default model("Song", songSchema);
