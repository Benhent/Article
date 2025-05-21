import Contact from '../models/contact.model.js';

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    return res.status(201).json({
      success: true,
      message: "Gửi yêu cầu liên hệ thành công",
      data: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi gửi yêu cầu liên hệ"
    });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Contact.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách yêu cầu liên hệ thành công",
      data: {
        contacts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi lấy danh sách yêu cầu liên hệ"
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin yêu cầu liên hệ thành công",
      data: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi lấy thông tin yêu cầu liên hệ"
    });
  }
};

const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ"
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: contact
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi cập nhật trạng thái"
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy yêu cầu liên hệ"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa yêu cầu liên hệ thành công"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Có lỗi xảy ra khi xóa yêu cầu liên hệ"
    });
  }
};

export {
  submitContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
};
