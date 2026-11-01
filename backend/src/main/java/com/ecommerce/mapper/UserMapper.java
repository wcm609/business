package com.ecommerce.mapper;

import com.ecommerce.entity.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface UserMapper {

    @Insert("insert into user(user_name,user_password,user_phone,user_register_time) " +
            "values(#{userName},#{userPassword},#{userPhone},#{userRegisterTime})")
    int insert(User user);

    @Select("select * from user where user_name=#{userName}")
    User findByUserName(String userName);

    @Select("select * from user where user_id=#{userId}")
    User findByUserId(Long userId);

    @Update("update user set user_password=#{userPassword} where user_id=#{userId}")
    int updatePassword(@Param("userId") Long userId, @Param("userPassword") String userPassword);
}
