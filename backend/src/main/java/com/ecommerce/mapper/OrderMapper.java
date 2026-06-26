package com.ecommerce.mapper;

import com.ecommerce.entity.Order;
import com.ecommerce.vo.OrderVO;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrderMapper {

    @Insert("insert into `order`(user_id,product_id,order_quantity,order_price,order_address,order_status,order_create_time) " +
            "values(#{userId},#{productId},#{orderQuantity},#{orderPrice},#{orderAddress},#{orderStatus},#{orderCreateTime})")
    int insert(Order order);

    @Select("select o.*, p.product_name, p.product_price, p.product_description " +
            "from `order` o left join product p on o.product_id = p.product_id " +
            "where o.user_id = #{userId} order by o.order_create_time desc")
    List<OrderVO> findByUserId(Long userId);

    @Update("update `order` set order_status = #{orderStatus} where order_id = #{orderId}")
    int update(@Param("orderId") Long orderId, @Param("orderStatus") Integer orderStatus);
}
