package com.ecommerce.controller;

import com.ecommerce.entity.Product;
import com.ecommerce.service.ProductService;
import com.ecommerce.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping("/add")
    public Result<Void> add(@RequestBody Product product) {
        productService.add(product);
        return Result.ok("添加成功");
    }

    @GetMapping("/detail")
    public Result<Product> detail(@RequestParam String productName) {
        Product product = productService.getByProductName(productName);
        return Result.success(product, "查询成功");
    }

    /**
     * 按 ID 查询商品详情（前端商品详情页使用）
     */
    @GetMapping("/{productId}")
    public Result<Product> detailById(@PathVariable Long productId) {
        Product product = productService.getById(productId);
        return Result.success(product, "查询成功");
    }

    @GetMapping("/list")
    public Result<List<Product>> list() {
        List<Product> products = productService.listAll();
        return Result.success(products, "查询成功");
    }
}
