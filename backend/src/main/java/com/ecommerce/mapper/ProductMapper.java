package com.ecommerce.mapper;

import com.ecommerce.entity.Product;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductMapper {
    @Insert("insert into product(product_name,product_price,product_stock,product_description,product_create_time) " +
            "values(#{productName},#{productPrice},#{productStock},#{productDescription},#{productCreateTime})")
    int insert(Product product);

    @Select("select * from product where product_name=#{productName}")
    Product findByProductName(String productName);

    @Select("select * from product")
    List<Product> findAll();
}
