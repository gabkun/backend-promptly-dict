import Memo from '../models/Memo.js'; 

// Create a new memo
const createMemo = async (req, res) => {
  const files = req.files; // Retrieve uploaded files from the request
  try {
    const { userId, title, memoType, description, additionalNotes } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }
    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    // For text memos, description is mandatory
    if (memoType === '1' && !description) {
      return res.status(400).json({ message: 'Text Memo (memoType 1) requires a description.' });
    }

    // Handling memoType 1 (Text Memo)
    if (memoType === '1') {
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'At least one image is required for Text Memo.' });
      }

      // Extract image file paths for text memo
      const imagePaths = files.map((file) => file.path);

      const newMemo = new Memo({
        userId,
        memoType,
        title,
        description,
        images: imagePaths, // Store file paths for uploaded images
        audio: undefined, // No audio for Text Memo
        additionalNotes,
        status: 'Text Memo', // Default status for memoType 1
      });

      const savedMemo = await newMemo.save();

      return res.status(201).json({
        message: 'Memo created successfully.',
        memo: savedMemo,
      });
    }

    // Handling memoType 2 (Voice Memo)
    if (memoType === '2') {
      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'Voice Memo requires an audio file.' });
      }

      // Extract the audio file path for voice memo
      const audioFilePath = files[0].path;

      const newMemo = new Memo({
        userId,
        memoType,
        title,
        description: undefined, // No description for Voice Memo
        images: [], // No images for Voice Memo
        audio: audioFilePath, // Store audio file path for voice memo
        additionalNotes,
        status: 'Voice Memo', // Default status for memoType 2
      });

      const savedMemo = await newMemo.save();

      return res.status(201).json({
        message: 'Voice Memo created successfully.',
        memo: savedMemo,
      });
    }

    // If memoType is not valid
    return res.status(400).json({ message: 'Invalid memoType.' });

  } catch (error) {
    console.error('Error creating memo:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


const getMemos = async (req, res) => {
  try {
    // Populate the `userId` to include `username`
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
    const memos = await Memo.find({ memoType: '2' }); // Query to filter by memoType '1'

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

    // Fetch memos where userId matches and memoType is 1
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

    // Ensure memoId is provided
    if (!memoId) {
      return res.status(400).json({ message: 'memoId is required.' });
    }

    // Fetch the memo by its ID
    const memo = await Memo.findById(memoId);

    // Check if memo exists
    if (!memo) {
      return res.status(404).json({ message: 'Memo not found.' });
    }

    // Return the memo details
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

    // Fetch memos where userId matches and memoType is 2
    const memos = await Memo.find({ userId, memoType: 2 });

    if (!memos || memos.length === 0) {
      return res.status(404).json({ message: 'No memos found for this user with memoType 2.' });
    }

    // Map memos to include consistent filePath
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