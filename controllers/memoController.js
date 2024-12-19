import Memo from '../models/Memo.js'; 

// Create a new memo
const createMemo = async (req, res) => {
  const files = req.files; 
  try {
    const { userId, title, memoType, description, additionalNotes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }
    if (memoType === '1' && !description) {
      return res.status(400).json({ message: 'Text Memo (memoType 1) requires a description.' });
    }

    if (memoType === '1') {
      const imagePaths = files ? files.map((file) => file.path) : [];

      const newMemo = new Memo({
        userId,
        memoType,
        title,
        description,
        images: imagePaths, 
        audio: undefined, 
        additionalNotes,
        status: 'Text Memo', 
      });

      const savedMemo = await newMemo.save();

      return res.status(201).json({
        message: 'Memo created successfully.',
        memo: savedMemo,
      });
    }

    if (memoType === '2') {
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Voice Memo requires an audio file.' });
      }

      const audioFilePath = files[0].path;

      const newMemo = new Memo({
        userId,
        memoType,
        title,
        description: undefined, 
        images: [], 
        audio: audioFilePath, 
        additionalNotes,
        status: 'Voice Memo', 
      });

      const savedMemo = await newMemo.save();

      return res.status(201).json({
        message: 'Voice Memo created successfully.',
        memo: savedMemo,
      });
    }

    return res.status(400).json({ message: 'Invalid memoType.' });

  } catch (error) {
    console.error('Error creating memo:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getMemos = async (req, res) => {
  try {
    const textMemos = await Memo.find({ memoType: 1 }).populate('userId', 'name');
    const voiceMemos = await Memo.find({ memoType: 2 }).populate('userId', 'name');

    res.status(200).json({
      message: 'Memos retrieved successfully.',
      textMemos,
      voiceMemos,
    });
  } catch (error) {
    console.error('Error fetching memos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getVoies = async (req, res) => {
  try {
    const memos = await Memo.find({ memoType: '2' }); 

    if (memos.length === 0) {
      return res.status(404).json({ message: 'No voice memos with memoType 1 found.' });
    }

    res.status(200).json({
      message: 'Voice memos retrieved successfully.',
      memos,
    });
  } catch (error) {
    console.error('Error fetching memos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getMemo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    const memos = await Memo.find({ userId, memoType: 1 });

    if (!memos || memos.length === 0) {
      return res.status(404).json({ message: 'No memos found for this user with memoType 1.' });
    }

    res.status(200).json({
      message: 'Memos retrieved successfully.',
      memos,
    });
  } catch (error) {
    console.error('Error retrieving memos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const viewMemoDetails = async (req, res) => {
  try {
    const { memoId } = req.params;

    if (!memoId) {
      return res.status(400).json({ message: 'memoId is required.' });
    }
    const memo = await Memo.findById(memoId);

    if (!memo) {
      return res.status(404).json({ message: 'Memo not found.' });
    }

    res.status(200).json({
      message: 'Memo retrieved successfully.',
      memo,
    });
  } catch (error) {
    console.error('Error retrieving memo details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const getVoice = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    const memos = await Memo.find({ userId, memoType: 2 });

    if (!memos || memos.length === 0) {
      return res.status(404).json({ message: 'No memos found for this user with memoType 2.' });
    }

    const processedMemos = memos.map((memo) => ({
      id: memo._id || null,
      title: memo.title || null,
      filePath: memo.audio ? memo.audio.replace(/\\/g, '/') : null, 
    }));

    res.status(200).json({
      message: 'Memos retrieved successfully.',
      memos: processedMemos,
    });
  } catch (error) {
    console.error('Error retrieving memos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const countTotalMemos = async (req, res) => {
  try {
    const totalMemos = await Memo.countDocuments();
    res.status(200).json({
      message: 'Total memos counted successfully.',
      totalMemos,
    });
  } catch (error) {
    console.error('Error counting total memos:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
  

const deleteTextMemo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Memo ID is required.' });
    }

    const deletedMemo = await Memo.findOneAndDelete({ _id: id, memoType: 1 });

    if (!deletedMemo) {
      return res.status(404).json({ message: 'Text memo not found.' });
    }

    res.status(200).json({ message: 'Text memo deleted successfully.', memo: deletedMemo });
  } catch (error) {
    console.error('Error deleting text memo:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteVoiceMemo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Memo ID is required.' });
    }

    const deletedMemo = await Memo.findOneAndDelete({ _id: id, memoType: 2 });

    if (!deletedMemo) {
      return res.status(404).json({ message: 'Voice memo not found.' });
    }

    res.status(200).json({ message: 'Voice memo deleted successfully.', memo: deletedMemo });
  } catch (error) {
    console.error('Error deleting voice memo:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export {createMemo, getMemo, getVoice, countTotalMemos, getMemos, getVoies, deleteTextMemo, deleteVoiceMemo, viewMemoDetails};