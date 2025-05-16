import { ArticleFile } from '../models/articles/articleFile.model.js';
import { Article } from '../models/articles/article.model.js';
import { v4 as uuidv4 } from 'uuid';

// Upload file cho bài báo - nhận URL từ Cloudinary đã được upload từ frontend
export const uploadArticleFile = async (req, res) => {
  try {
    const { 
      articleId, 
      fileCategory, 
      round = 1,
      fileName,
      originalName,
      fileType,
      fileSize,
      fileUrl
    } = req.body;
    
    // Kiểm tra bài báo tồn tại
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền upload file (người tạo, biên tập viên hoặc admin)
    const isAuthor = article.isAuthor(req.user._id);
    const isEditor = article.editorId && article.editorId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isEditor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền tải file cho bài báo này' });
    }
    
    // Kiểm tra trạng thái bài báo phù hợp để upload file
    const allowedUploadStatuses = ['draft', 'revisionRequired', 'resubmitted'];
    
    if (!allowedUploadStatuses.includes(article.status) && !isAdmin && !isEditor) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể tải file lên khi bài báo ở trạng thái ${article.status}` 
      });
    }
    
    // Nếu đây là file bản thảo mới, đánh dấu các file cũ không còn active
    if (fileCategory === 'manuscript') {
      await ArticleFile.updateMany(
        { articleId, fileCategory: 'manuscript', round, isActive: true },
        { $set: { isActive: false } }
      );
    }
    
    // Xác định phiên bản file
    const fileCount = await ArticleFile.countDocuments({ 
      articleId, 
      fileCategory, 
      round 
    });
    
    // Tạo bản ghi file mới
    const fileVersion = fileCount + 1;
    const newFile = new ArticleFile({
      articleId,
      fileName: fileName || uuidv4(), // Sử dụng fileName từ frontend hoặc tạo mới
      originalName,
      fileType,
      fileSize,
      filePath: fileUrl, // Sử dụng fileUrl làm filePath
      fileUrl,
      fileVersion,
      round: parseInt(round),
      fileCategory,
      uploadedBy: req.user._id,
      isActive: true
    });
    
    await newFile.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Tải file lên thành công', 
      data: newFile 
    });
  } catch (error) {
    console.error('Error uploading article file:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tải file lên' });
  }
};

// Lấy danh sách file của bài báo
export const getArticleFiles = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { round, fileCategory } = req.query;
    
    // Xây dựng query filter
    const filter = { articleId };
    if (round) filter.round = parseInt(round);
    if (fileCategory) filter.fileCategory = fileCategory;
    
    // Lấy thông tin bài báo để kiểm tra quyền truy cập
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền truy cập file
    const isAuthor = article.isAuthor(req.user._id);
    const isEditor = article.editorId && article.editorId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'editor' || req.user.role === 'chiefEditor';
    const isReviewer = await Review.exists({ 
      articleId, 
      reviewerId: req.user._id,
      status: { $in: ['accepted', 'completed'] }
    });
    
    if (!isAuthor && !isEditor && !isAdmin && !isReviewer) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem file của bài báo này' });
    }
    
    // Lấy danh sách file
    const files = await ArticleFile.find(filter)
      .populate('uploadedBy', 'fullName email')
      .sort({ round: -1, fileCategory: 1, uploadedAt: -1 });
    
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error('Error getting article files:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách file' });
  }
};

// Xóa file bài báo
export const deleteArticleFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const file = await ArticleFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    }
    
    // Lấy thông tin bài báo để kiểm tra quyền xóa
    const article = await Article.findById(file.articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền xóa file (người tạo khi còn ở trạng thái nháp hoặc admin)
    const isAuthor = article.isAuthor(req.user._id);
    const isAdmin = req.user.role === 'admin';
    
    if ((!isAuthor || article.status !== 'draft') && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa file này' });
    }
    
    // Không cần xóa file trên Cloudinary vì frontend đã upload trực tiếp
    
    // Xóa bản ghi file
    await ArticleFile.findByIdAndDelete(fileId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Xóa file thành công' 
    });
  } catch (error) {
    console.error('Error deleting article file:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa file' });
  }
};

// Cập nhật trạng thái file
export const updateFileStatus = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { isActive } = req.body;
    
    const file = await ArticleFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    }
    
    // Chỉ biên tập viên và admin có quyền cập nhật trạng thái file
    if (req.user.role !== 'admin' && req.user.role !== 'editor' && req.user.role !== 'chiefEditor') {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật trạng thái file' });
    }
    
    // Cập nhật trạng thái
    file.isActive = isActive;
    await file.save();
    
    res.status(200).json({ 
      success: true, 
      message: `File đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`, 
      data: file 
    });
  } catch (error) {
    console.error('Error updating file status:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái file' });
  }
};

// Lấy nội dung file
export const getArticleFileContent = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Kiểm tra file tồn tại
    const file = await ArticleFile.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy file' });
    }
    
    // Lấy thông tin bài báo để kiểm tra quyền truy cập
    const article = await Article.findById(file.articleId);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền truy cập file
    const isAuthor = article.isAuthor(req.user._id);
    const isEditor = article.editorId && article.editorId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'editor' || req.user.role === 'chiefEditor';
    const isReviewer = await Review.exists({ 
      articleId: file.articleId, 
      reviewerId: req.user._id,
      status: { $in: ['accepted', 'completed'] }
    });
    
    if (!isAuthor && !isEditor && !isAdmin && !isReviewer) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem nội dung file này' });
    }
    
    // Trả về URL của file để frontend có thể tải về
    res.status(200).json({ 
      success: true, 
      data: { 
        fileUrl: file.fileUrl,
        fileName: file.originalName
      } 
    });
  } catch (error) {
    console.error('Error getting article file content:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy nội dung file' });
  }
};