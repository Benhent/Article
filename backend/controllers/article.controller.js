import { ArticleAuthor } from '../models/articles/articleAuthor.model.js';
import { ArticleFile } from '../models/articles/articleFile.model.js';
import { StatusHistory } from '../models/articles/statusHistory.model.js';
import { Article } from '../models/articles/article.model.js';

// Lấy danh sách bài báo với phân trang và lọc
export const getArticles = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { status, field, submitterId, editorId, search } = req.query;
    
    // Xây dựng query filter
    const filter = {};
    if (status) filter.status = status;
    if (field) filter.field = field;
    if (submitterId) filter.submitterId = submitterId;
    if (editorId) filter.editorId = editorId;
    
    // Xử lý tìm kiếm text
    let searchQuery = {};
    if (search) {
      searchQuery = { $text: { $search: search } };
    }
    
    // Thực hiện truy vấn với filter và phân trang
    const articles = await Article.find({ ...filter, ...searchQuery })
      .populate('field', 'name')
      .populate('submitterId', 'fullName email')
      .populate('editorId', 'fullName email')
      .populate('articleFile')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Đếm tổng số bài báo thỏa điều kiện
    const total = await Article.countDocuments({ ...filter, ...searchQuery });
    
    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting articles:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách bài báo' });
  }
};

// Lấy chi tiết bài báo
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id)
      .populate('field', 'name')
      .populate('secondaryFields', 'name')
      .populate('submitterId', 'fullName email institution country')
      .populate('editorId', 'fullName email')
      .populate('articleFile')
      .populate({
        path: 'authors.userId',
        select: 'fullName email institution country'
      });
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Tăng số lượt xem
    article.viewCount += 1;
    await article.save();
    
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông tin bài báo' });
  }
};

// Tạo bài báo mới
export const createArticle = async (req, res) => {
  try {
    const {
      titlePrefix,
      title,
      subtitle,
      thumbnail,
      abstract,
      keywords,
      articleLanguage,
      otherLanguage,
      field,
      secondaryFields,
      authors,
      submitterNote
    } = req.body;
    
    // Lấy submitterId từ user đã xác thực
    const submitterId = req.user._id;
    
    const initialStatus = new StatusHistory({
      status: 'draft',
      changedBy: submitterId,
      timestamp: new Date(),
      reason: 'Tạo bài báo mới'
    });

    await initialStatus.save();

    // Tạo bài báo mới
    const article = new Article({
      titlePrefix,
      title,
      subtitle,
      thumbnail,
      abstract,
      keywords: Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim()),
      articleLanguage,
      otherLanguage,
      field,
      secondaryFields: secondaryFields || [],
      submitterId,
      submitterNote,
      status: 'draft',
      statusHistory: [initialStatus._id]
    });
    
    await article.save();

    // Xử lý tác giả
    if (authors && Array.isArray(authors)) {
      const authorPromises = authors.map(async (authorData, index) => {
        const articleAuthor = new ArticleAuthor({
          articleId: article._id,
          userId: authorData.userId || null,
          hasAccount: !!authorData.userId,
          fullName: authorData.fullName,
          email: authorData.email,
          institution: authorData.institution,
          country: authorData.country,
          isCorresponding: authorData.isCorresponding,
          order: index + 1,
          orcid: authorData.orcid || null
        });
        await articleAuthor.save();
        return articleAuthor._id;
      });

      const authorIds = await Promise.all(authorPromises);
      article.authors = authorIds;
      await article.save();
    }
    
    const populatedArticle = await Article.findById(article._id)
      .populate('statusHistory')
      .populate('authors')
      .populate('field')
      .populate('secondaryFields');

    res.status(201).json({ 
      success: true, 
      message: 'Tạo bài báo mới thành công', 
      data: populatedArticle 
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo bài báo mới' 
    });
  }
};

// Cập nhật bài báo
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Xử lý keywords nếu là string
    if (updateData.keywords && typeof updateData.keywords === 'string') {
      updateData.keywords = updateData.keywords.split(',').map(k => k.trim());
    }
    
    // Xử lý authors nếu là string
    if (updateData.authors && typeof updateData.authors === 'string') {
      updateData.authors = JSON.parse(updateData.authors);
    }
    
    const article = await Article.findById(id).populate('authors');
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền cập nhật (chỉ người tạo hoặc editor được chỉ định hoặc admin)
    const isAuthor = article.isAuthor(req.user._id);
    const isEditor = article.editorId && article.editorId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isEditor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật bài báo này' });
    }
    
    // Kiểm tra trạng thái bài báo (chỉ có thể cập nhật khi ở trạng thái draft, revisionRequired, resubmitted)
    const allowedUpdateStatuses = ['draft', 'revisionRequired', 'resubmitted'];
    if (!allowedUpdateStatuses.includes(article.status) && !isAdmin && !isEditor) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể cập nhật bài báo ở trạng thái ${article.status}` 
      });
    }
    
    // Cập nhật bài báo
    Object.keys(updateData).forEach(key => {
      article[key] = updateData[key];
    });
    
    await article.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật bài báo thành công', 
      data: article 
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật bài báo' });
  }
};

// Thay đổi trạng thái bài báo
export const changeArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Kiểm tra quyền thay đổi trạng thái (chỉ người tạo, editor hoặc admin)
    const isAuthor = article.isAuthor(req.user._id);
    const isEditor = article.editorId && article.editorId.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    
    if (!isAuthor && !isEditor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Không có quyền thay đổi trạng thái bài báo này' });
    }
    
    // Xác thực luồng thay đổi trạng thái hợp lệ
    const validTransitions = {
      'draft': ['submitted'],
      'submitted': ['underReview', 'rejected'],
      'underReview': ['revisionRequired', 'accepted', 'rejected'],
      'revisionRequired': ['resubmitted'],
      'resubmitted': ['underReview'],
      'accepted': ['published'],
      'rejected': [],
      'published': []
    };
    
    if (!validTransitions[article.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Không thể thay đổi trạng thái từ ${article.status} sang ${status}`
      });
    }
    
    // Kiểm tra các điều kiện bổ sung cho từng trạng thái
    if (status === 'submitted') {
      // Kiểm tra xem đã upload file bản thảo chưa
      const hasManuscript = await ArticleFile.exists({
        articleId: id,
        fileCategory: 'manuscript',
        isActive: true
      });
      
      if (!hasManuscript) {
        return res.status(400).json({
          success: false,
          message: 'Cần tải lên file bản thảo trước khi nộp bài'
        });
      }
    }
    
    // Thay đổi trạng thái
    await article.changeStatus(status, req.user._id, reason);
    
    res.status(200).json({ 
      success: true, 
      message: `Thay đổi trạng thái bài báo thành ${status} thành công`, 
      data: article 
    });
  } catch (error) {
    console.error('Error changing article status:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi thay đổi trạng thái bài báo' });
  }
};

// Chỉ định biên tập viên cho bài báo
export const assignEditor = async (req, res) => {
  try {
    const { id } = req.params;
    const { editorId } = req.body;
    
    // Chỉ admin mới có quyền chỉ định biên tập viên
    if (req.user.role !== 'admin' && req.user.role !== 'chiefEditor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Chỉ quản trị viên hoặc tổng biên tập có quyền chỉ định biên tập viên' 
      });
    }
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Cập nhật biên tập viên
    article.editorId = editorId;
    await article.save();
    
    // Thêm ghi chú nội bộ về việc chỉ định
    // article.internalNotes.push({
    //   userId: req.user._id,
    //   note: `Đã chỉ định biên tập viên ID: ${editorId}`,
    //   timestamp: new Date()
    // });
    // await article.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Chỉ định biên tập viên thành công', 
      data: article 
    });
  } catch (error) {
    console.error('Error assigning editor:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi chỉ định biên tập viên' });
  }
};

// Xuất bản bài báo
export const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { doi, issueId, pageStart, pageEnd } = req.body;
    
    // Kiểm tra quyền xuất bản
    if (req.user.role !== 'admin' && req.user.role !== 'chiefEditor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Chỉ quản trị viên hoặc tổng biên tập có quyền xuất bản bài báo' 
      });
    }
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Chỉ bài báo được chấp nhận mới có thể xuất bản
    if (article.status !== 'accepted') {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ bài báo được chấp nhận mới có thể xuất bản' 
      });
    }
    
    // Kiểm tra trùng DOI
    if (doi) {
      const existingDoi = await Article.findOne({ doi, _id: { $ne: id } });
      if (existingDoi) {
        return res.status(400).json({ success: false, message: 'DOI đã tồn tại trong hệ thống' });
      }
    }
    
    // Cập nhật thông tin xuất bản
    article.doi = doi;
    article.issueId = issueId;
    article.pageStart = pageStart;
    article.pageEnd = pageEnd;
    
    // Thay đổi trạng thái
    await article.changeStatus('published', req.user._id, 'Bài báo đã được xuất bản');
    
    res.status(200).json({ 
      success: true, 
      message: 'Xuất bản bài báo thành công', 
      data: article 
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xuất bản bài báo' });
  }
};

// Xóa bài báo (chỉ áp dụng cho bài nháp)
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findById(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài báo' });
    }
    
    // Chỉ cho phép xóa bài báo ở trạng thái nháp
    if (article.status !== 'draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ có thể xóa bài báo ở trạng thái nháp' 
      });
    }
    
    // Kiểm tra quyền xóa (chỉ người tạo hoặc admin)
    if (!article.submitterId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa bài báo này' });
    }
    
    // Xóa tất cả file liên quan
    await ArticleFile.deleteMany({ articleId: id });
    
    // Xóa bài báo
    await Article.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Xóa bài báo thành công' 
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa bài báo' });
  }
};

// Lấy thống kê bài báo
export const getArticleStats = async (req, res) => {
  try {
    const stats = await Article.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Chuyển đổi kết quả thành object dễ sử dụng
    const result = {};
    stats.forEach(item => {
      result[item._id] = item.count;
    });
    
    // Thêm tổng số
    result.total = await Article.countDocuments();
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error getting article stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê bài báo' });
  }
};