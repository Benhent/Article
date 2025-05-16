import {ArticleAuthor} from '../models/articles/articleAuthor.model.js';
import {User} from '../models/user.model.js';
import {Article} from '../models/articles/article.model.js';

export const createArticleAuthor = async (req, res) => {
  try {
    const {
      articleId,
      userId,
      hasAccount,
      fullName,
      email,
      institution,
      country,
      isCorresponding,
      order,
      orcid
    } = req.body;

    // Kiểm tra article tồn tại
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Bài báo không tồn tại'
      });
    }

    // If hasAccount is true, check if user exists
    if (hasAccount && userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }
    }

    // Create new article author
    const articleAuthor = new ArticleAuthor({
      articleId,
      userId,
      hasAccount,
      fullName,
      email,
      institution,
      country,
      isCorresponding,
      order,
      orcid
    });

    await articleAuthor.save();

    // Cập nhật danh sách tác giả của bài báo
    article.authors.push(articleAuthor._id);
    await article.save();

    res.status(201).json({
      success: true,
      message: 'Tạo tác giả bài báo thành công',
      data: articleAuthor
    });
  } catch (error) {
    console.log("Failed to create article author", error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo tác giả bài báo'
    });
  }
};

export const getAllArticleAuthors = async (req, res) => {
  try {
    const { hasAccount, isCorresponding } = req.query;
    const filter = {};

    if (hasAccount !== undefined) filter.hasAccount = hasAccount;
    if (isCorresponding !== undefined) filter.isCorresponding = isCorresponding;

    const articleAuthors = await ArticleAuthor.find(filter)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: articleAuthors.length,
      data: articleAuthors
    });
  } catch (error) {
    console.error("Error in getAllArticleAuthors:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching article authors"
    });
  }
};

export const getArticleAuthor = async (req, res) => {
  try {
    const articleAuthor = await ArticleAuthor.findById(req.params.id)
      .populate('userId', 'name email');

    if (!articleAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Article author not found'
      });
    }

    res.status(200).json({
      success: true,
      data: articleAuthor
    });
  } catch (error) {
    console.error("Error in getArticleAuthor:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching article author"
    });
  }
};

export const updateArticleAuthor = async (req, res) => {
  try {
    const { userId } = req.body;
    
    // If userId is being updated, check if user exists
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    const articleAuthor = await ArticleAuthor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!articleAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Article author not found'
      });
    }

    res.status(200).json({
      success: true,
      data: articleAuthor
    });
  } catch (error) {
    console.error("Error in update ArticleAuthor:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating article author"
    });
  }
};

export const deleteArticleAuthor = async (req, res) => {
  try {
    const articleAuthor = await ArticleAuthor.findById(req.params.id);

    if (!articleAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Article author not found'
      });
    }

    await Article.findByIdAndUpdate(articleAuthor.articleId, {
      $pull: { authors: articleAuthor._id }
    });
    
    await ArticleAuthor.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa tác giả bài báo thành công'
    });
  } catch (error) {
    console.error("Error in delete ArticleAuthor:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting article author"
    });
  }
};

export const getArticleAuthorsByArticle = async (req, res) => {
  try {
    // This function assumes there's a relationship between articles and authors
    // You may need to adjust this based on your actual data model
    const articleAuthors = await ArticleAuthor.find({ articleId: req.params.articleId })
      .populate('userId', 'name email')
      .sort('order');

    res.status(200).json({
      success: true,
      message: 'Lấy tác giả bài báo thành công',
      count: articleAuthors.length,
      data: articleAuthors
    });
  } catch (error) {
    console.error("Error in getArticleAuthorsByArticle:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching article authors"
    });
  }
}; 