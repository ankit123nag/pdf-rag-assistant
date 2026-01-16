import "dotenv/config";
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { Queue } from 'bullmq';
import clerkClient, { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const app = express();
app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${uniqueSuffix}-${file.originalname}`)
    }
})

const upload = multer({ storage: storage });

const queue = new Queue('file-upload-queue');

app.get('/', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req?.auth?.userId ?? '';

    const user = await clerkClient.users.getUser(userId);
    return res.json({
        message: `Thank you ${user.firstName ?? ''} ${user.lastName ?? ''}, for visiting!`
    })
});

app.post('/upload/pdf', ClerkExpressRequireAuth(), upload.single('pdf'), async (req, res) => {
    await queue.add('file-ready', JSON.stringify({
        fileName: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path
    }));
    return res.json({ message: "Uploaded Successfully" })
});

app.listen(8000, () => {
    console.log(`Server Started on POST: ${8000}`)
});
