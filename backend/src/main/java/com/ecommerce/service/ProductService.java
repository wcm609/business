package com.ecommerce.service;

import com.ecommerce.entity.Product;

import java.util.List;

public interface ProductService {

    /**
     * 根据商品名称查询
     */
    Product getByProductName(String productName);

    /**
     * 新增商品
     */
    void add(Product product);

    /**
     * 查询所有商品
     */
    List<Product> listAll();
}
