import express from 'express'
import {createMemo, getMemo, getVoice, countTotalMemos, deleteTextMemo, deleteVoiceMemo, viewMemoDetails} from '../controllers/memoController.js'
import multer from 'multer';
import path from 'path';
import { get } from 'http';

const storage = multer.diskStorage({
    destination: path.join('uploads'), // Save files in the 'uploads' directory
    filename: function (req, file, cb) {
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${file.originalname}`;
      cb(null, uniqueName); // Add a timestamp to ensure unique file names
    },
  });
  
  const upload = multer({
    storage: storage,
    limits: { fieldSize: 25 * 1024 * 1024 }, // 25 MB file size limit
  });

const router = express.Router();

router.post('/register', upload.any(), createMemo);
router.get('/:userId', getMemo);
router.get('/getvoice/:userId', getVoice);
router.get('/', countTotalMemos);
router.get('/view/:memoId', viewMemoDetails);
router.delete('/deleteTextMemo/:id', deleteTextMemo);
router.delete('/deleteVoiceMemo/:id', deleteVoiceMemo);


export default router;