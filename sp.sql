CREATE OR REPLACE FUNCTION approve_author_request_transaction(
    request_id UUID,
    admin_id UUID
) RETURNS VOID AS $$
DECLARE
    v_user_id UUID;
    v_first_name TEXT;
    v_last_name TEXT;
    v_academic_title TEXT;
    v_bio TEXT;
    v_institution_id UUID;
    v_author_id UUID;
    v_existing_author_id UUID;
BEGIN
    -- Lấy thông tin từ yêu cầu
    SELECT 
        user_id, first_name, last_name, academic_title, bio, institution_id
    INTO 
        v_user_id, v_first_name, v_last_name, v_academic_title, v_bio, v_institution_id
    FROM 
        author_requests
    WHERE 
        id = request_id AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Author request not found or not in pending status';
    END IF;
    
    -- Cập nhật trạng thái yêu cầu
    UPDATE author_requests
    SET 
        status = 'accepted',
        approved_by = admin_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE 
        id = request_id;
    
    -- Kiểm tra xem người dùng đã có thông tin tác giả chưa
    SELECT id INTO v_existing_author_id
    FROM authors
    WHERE user_id = v_user_id;
    
    IF v_existing_author_id IS NOT NULL THEN
        -- Cập nhật thông tin tác giả hiện có
        UPDATE authors
        SET 
            first_name = v_first_name,
            last_name = v_last_name,
            academic_title = v_academic_title,
            bio = v_bio,
            institution_id = v_institution_id,
            updated_at = NOW()
        WHERE 
            id = v_existing_author_id
        RETURNING id INTO v_author_id;
    ELSE
        -- Tạo thông tin tác giả mới
        INSERT INTO authors (
            user_id, first_name, last_name, academic_title, bio, institution_id, created_at, updated_at
        )
        VALUES (
            v_user_id, v_first_name, v_last_name, v_academic_title, v_bio, v_institution_id, NOW(), NOW()
        )
        RETURNING id INTO v_author_id;
    END IF;
    
    -- Cập nhật vai trò người dùng thành "author"
    UPDATE users
    SET 
        role = 'author',
        updated_at = NOW()
    WHERE 
        id = v_user_id;
    
    -- Xử lý các thông tin khác như bài báo, tạp chí, sách sẽ được thực hiện ở phía ứng dụng
END;
$$ LANGUAGE plpgsql;