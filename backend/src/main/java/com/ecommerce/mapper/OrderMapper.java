package com.ecommerce.mapper;

import com.ecommerce.entity.Order;
import com.ecommerce.vo.OrderVO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface OrderMapper {

    @Insert("insert into `order`(user_id,product_id,order_quantity,order_price,order_address,order_status,order_create_time) " +
            "values(#{userId},#{productId},#{orderQuantity},#{orderPrice},#{orderAddress},#{orderStatus},#{orderCreateTime})")
    int insert(Order order);

    @Select("select * from `order` where order_id = #{orderId}")
    Order findById(Long orderId);

    @Select("select o.*, p.product_name, p.product_price, p.product_description " +
            "from `order` o left join product p on o.product_id = p.product_id " +
            "where o.user_id = #{userId} order by o.order_create_time desc")
    List<OrderVO> findByUserId(Long userId);

    /**
     * 带前置状态的状态流转，避免重复支付 / 并发修改
     * 返回 0 表示订单当前状态与预期不符
     */
    @Update("update `order` set order_status = #{nextStatus} " +
            "where order_id = #{orderId} and order_status = #{currentStatus}")
    int updateStatus(@Param("orderId") Long orderId,
                     @Param("currentStatus") Integer currentStatus,
                     @Param("nextStatus") Integer nextStatus);
}
