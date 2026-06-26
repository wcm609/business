package com.ecommerce.service.impl;

import com.ecommerce.entity.Product;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;

    @Override
    public Product getByProductName(String productName) {
        Product product = productMapper.findByProductName(productName);
        if (product == null) {
            throw new IllegalArgumentException("商品不存在: " + productName);
        }
        return product;
    }

    @Override
    public List<Product> listAll() {
        return productMapper.findAll();
    }

    @Override
    public void add(Product product) {
        product.setProductCreateTime(LocalDateTime.now());
        productMapper.insert(product);
        log.info("新增商品: {}", product.getProductName());
    }
}
