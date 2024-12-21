import expressAsyncHandler from "express-async-handler";
import aws from "aws-sdk";
import { Request, Response } from "express";
import Song from "../model/Song";
import { v4 as uuid } from "uuid";
import getSignedUrl from "../utils/getSignedUrl";
import { validationResult } from "express-validator";
export const createSong = expressAsyncHandler(
  async (req: Request, res: Response): Promise<any> => {
    if (!req.file)
      return res.status(400).json({ message: "Missing poster image" });
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const {
      name,
      title,
      year,
      deezer,
      tidal,
      boom,
      youtube,
      spotify,
      itunes,
      amazon,
    } = req.body;
    aws.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    const S3 = new aws.S3();
    const filename = `${uuid()}-${req.file.filename}`;
    const uploadRes = await S3.upload({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: filename,
      Body: req.file.buffer,
      // ACL: "public-read",
      ACL: "private",
    }).promise();
    console.log(uploadRes);

    const newSong = await Song.create({
      name,
      title,
      year,
      posterImage: filename,
      links: { deezer, tidal, boom, youtube, spotify, itunes, amazon },
    });

    return res.status(201).json({ id: newSong._id });
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
    const existingSong = await Song.findById(id).lean().exec();
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
    if (!existingSong) return res.status(404).json({ message: "Not found" });

    const {
      name,
      title,
      year,
      deezer,
      tidal,
      boom,
      youtube,
      spotify,
      itunes,
      amazon,
    } = req.body;

    if (req.file) {
      aws.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      });
      const S3 = new aws.S3();
      const filename = `${uuid()}-${req.file.filename}`;
      const uploadRes = await S3.upload({
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: filename,
        Body: req.file.buffer,
        // ACL: "public-read",
        ACL: "private",
      }).promise();
      console.log(uploadRes);
    }

    if (name) existingSong.name = name;
    if (title) existingSong.title = title;
    if (year) existingSong.year = year;

    existingSong.links = {
      deezer,
      tidal,
      boom,
      youtube,
      spotify,
      itunes,
      amazon,
    };

    await existingSong.save();
    return res.status(200).json({ message: "Updated" });
  }
);
