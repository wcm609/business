package com.ecommerce.mapper;

import com.ecommerce.entity.Product;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import java.util.List;

@Mapper
public interface ProductMapper {

    @Insert("insert into product(product_name,product_price,product_stock,product_description,product_create_time) " +
            "values(#{productName},#{productPrice},#{productStock},#{productDescription},#{productCreateTime})")
    int insert(Product product);

    @Select("select * from product where product_name=#{productName}")
    Product findByProductName(String productName);

    @Select("select * from product where product_id=#{productId}")
    Product findById(Long productId);

    @Select("select * from product order by product_id asc")
    List<Product> findAll();

    /**
     * 扣减库存：仅当库存充足时才更新，返回受影响行数（0 表示库存不足）
     */
    @Update("update product set product_stock = product_stock - #{quantity} " +
            "where product_id = #{productId} and product_stock >= #{quantity}")
    int decreaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);

    /**
     * 回滚库存（取消订单时使用）
     */
    @Update("update product set product_stock = product_stock + #{quantity} where product_id = #{productId}")
    int increaseStock(@Param("productId") Long productId, @Param("quantity") Integer quantity);
}
