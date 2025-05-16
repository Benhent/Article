import {Issue} from '../models/articles/issue.model.js';
import {Article} from '../models/articles/article.model.js';

// Lấy danh sách số báo
export const getIssues = async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    const { isPublished, search } = req.query;

    // Xây dựng query filter
    const filter = {};
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }
    
    // Xử lý tìm kiếm
    if (search) {
      filter.$text = { $search: search };
    }

    // Lấy danh sách số báo
    const issues = await Issue.find(filter)
      .sort({ volumeNumber: -1, issueNumber: -1 })
      .skip(skip)
      .limit(limit)
      .populate('articles', 'title status');

    // Đếm tổng số
    const total = await Issue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: issues,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting issues:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách số báo' 
    });
  }
};

// Lấy chi tiết số báo
export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const issue = await Issue.findById(id)
      .populate({
        path: 'articles',
        select: 'title abstract authors status createdAt',
        populate: {
          path: 'authors.userId',
          select: 'fullName email institution'
        }
      });

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    console.error('Error getting issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin số báo' 
    });
  }
};

// Tạo số báo mới
export const createIssue = async (req, res) => {
  try {
    const { title, volumeNumber, issueNumber, publicationDate, articles } = req.body;

    // Kiểm tra trùng lặp volume và issue
    const existingIssue = await Issue.findOne({ volumeNumber, issueNumber });
    if (existingIssue) {
      return res.status(400).json({
        success: false,
        message: 'Số báo đã tồn tại'
      });
    }

    // Tạo số báo mới
    const issue = new Issue({
      title,
      volumeNumber,
      issueNumber,
      publicationDate,
      articles: articles || []
    });

    await issue.save();

    // Cập nhật issueId cho các bài báo
    if (articles && articles.length > 0) {
      await Article.updateMany(
        { _id: { $in: articles } },
        { $set: { issueId: issue._id } }
      );
    }

    res.status(201).json({ 
      success: true, 
      message: 'Tạo số báo thành công',
      data: issue 
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo số báo' 
    });
  }
};

// Cập nhật số báo
export const updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    // Kiểm tra trùng lặp volume và issue nếu có thay đổi
    if (updateData.volumeNumber || updateData.issueNumber) {
      const existingIssue = await Issue.findOne({
        volumeNumber: updateData.volumeNumber || issue.volumeNumber,
        issueNumber: updateData.issueNumber || issue.issueNumber,
        _id: { $ne: id }
      });
      if (existingIssue) {
        return res.status(400).json({
          success: false,
          message: 'Số báo đã tồn tại'
        });
      }
    }

    // Cập nhật số báo
    Object.keys(updateData).forEach(key => {
      issue[key] = updateData[key];
    });

    await issue.save();

    // Cập nhật issueId cho các bài báo nếu có thay đổi
    if (updateData.articles) {
      // Xóa issueId của các bài báo cũ
      await Article.updateMany(
        { _id: { $in: issue.articles } },
        { $unset: { issueId: 1 } }
      );

      // Thêm issueId cho các bài báo mới
      await Article.updateMany(
        { _id: { $in: updateData.articles } },
        { $set: { issueId: issue._id } }
      );
    }

    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật số báo thành công',
      data: issue 
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật số báo' 
    });
  }
};

// Xóa số báo
export const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    // Kiểm tra nếu số báo đã xuất bản
    if (issue.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa số báo đã xuất bản'
      });
    }

    // Xóa số báo
    await Issue.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: 'Xóa số báo thành công' 
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa số báo' 
    });
  }
};

// Xuất bản số báo
export const publishIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const issue = await Issue.findById(id).populate('articles');
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    // Kiểm tra nếu số báo đã xuất bản
    if (issue.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Số báo đã được xuất bản'
      });
    }

    // Kiểm tra các bài báo trong số
    if (issue.articles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Số báo không có bài báo nào'
      });
    }

    // Kiểm tra trạng thái của các bài báo
    const invalidArticles = issue.articles.filter(article => 
      article.status !== 'accepted' && article.status !== 'published'
    );

    if (invalidArticles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Có bài báo chưa được chấp nhận hoặc xuất bản',
        data: invalidArticles.map(article => ({
          id: article._id,
          title: article.title,
          status: article.status
        }))
      });
    }

    // Cập nhật trạng thái xuất bản
    issue.isPublished = true;
    await issue.save();

    // Cập nhật trạng thái các bài báo
    await Article.updateMany(
      { _id: { $in: issue.articles } },
      { $set: { status: 'published' } }
    );

    res.status(200).json({ 
      success: true, 
      message: 'Xuất bản số báo thành công',
      data: issue 
    });
  } catch (error) {
    console.error('Error publishing issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xuất bản số báo' 
    });
  }
};

// Thêm bài báo vào số
export const addArticleToIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { articleId } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    // Kiểm tra nếu số báo đã xuất bản
    if (issue.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Không thể thêm bài báo vào số đã xuất bản'
      });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy bài báo' 
      });
    }

    // Kiểm tra nếu bài báo đã thuộc số khác
    if (article.issueId && !article.issueId.equals(issue._id)) {
      return res.status(400).json({
        success: false,
        message: 'Bài báo đã thuộc số khác'
      });
    }

    // Thêm bài báo vào số
    if (!issue.articles.includes(articleId)) {
      issue.articles.push(articleId);
      await issue.save();
    }

    // Cập nhật issueId cho bài báo
    article.issueId = issue._id;
    await article.save();

    res.status(200).json({ 
      success: true, 
      message: 'Thêm bài báo vào số thành công',
      data: issue 
    });
  } catch (error) {
    console.error('Error adding article to issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi thêm bài báo vào số' 
    });
  }
};

// Xóa bài báo khỏi số
export const removeArticleFromIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { articleId } = req.body;

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy số báo' 
      });
    }

    // Kiểm tra nếu số báo đã xuất bản
    if (issue.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa bài báo khỏi số đã xuất bản'
      });
    }

    // Xóa bài báo khỏi số
    issue.articles = issue.articles.filter(id => !id.equals(articleId));
    await issue.save();

    // Xóa issueId của bài báo
    await Article.findByIdAndUpdate(articleId, { $unset: { issueId: 1 } });

    res.status(200).json({ 
      success: true, 
      message: 'Xóa bài báo khỏi số thành công',
      data: issue 
    });
  } catch (error) {
    console.error('Error removing article from issue:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa bài báo khỏi số' 
    });
  }
};
