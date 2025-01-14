import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import Song from "../model/Song";
import { v4 as uuid } from "uuid";
import getSignedUrl from "../utils/getSignedUrl";
import { validationResult } from "express-validator";

export const createSong = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    if (!req.file)
      return res.status(400).json({ message: "Missing poster image" });
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, title, year, links } = req.body;
    console.log(links)
    const filename = `${uuid()}-${req.file.filename}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: req.file.buffer,
    };

    const command = new PutObjectCommand(params);
    const uploadRes = await s3Client.send(command);
    console.log(uploadRes);

    const newSong = await Song.create({
      linkId: `${name.replace(/\s+/g, "")}-${title.replace(/\s+/g, "")}`,
      name,
      title,
      year,
      posterImage: filename,
      links: JSON.parse(links),
    });

    return res.status(201).json({ id: newSong.linkId });
  }
);

export const getSongs = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const allSongs = await Song.find({}).lean().exec();
    res.status(200).json([...allSongs]);
  }
);

export const getSongbyId = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const existingSong = await Song.findOne({ linkId: id }).lean().exec();
    if (!existingSong) return res.status(404).json({ message: "Not found" });

    return res.status(200).json({
      ...existingSong,
      posterImage: await getSignedUrl(existingSong.posterImage),
    });
  }
);

export const deleteSong = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    await Song.findByIdAndDelete(id).lean().exec();
    res.status(200).json({ message: "Successfully deleted" });
  }
);

export const editSong = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const existingSong = await Song.findById(id).exec();
    const s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    if (!existingSong) return res.status(404).json({ message: "Not found" });

    const { name, title, year, links } = req.body;

    if (req.file) {
      const filename = `${uuid()}-${req.file.filename}`;
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: filename,
        Body: req.file.buffer,
      };
      const command = new PutObjectCommand(params);
      const uploadRes = await s3Client.send(command);
      console.log(uploadRes);
    }

    if (name) existingSong.name = name;
    if (title) existingSong.title = title;
    if (year) existingSong.year = year;
    existingSong.links = JSON.parse(links);
    await existingSong.save();
    return res.status(200).json({ message: "Updated" });
  }
);
