package com.ecommerce.controller;

import com.ecommerce.entity.Product;
import com.ecommerce.service.ProductService;
import com.ecommerce.vo.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/list")
    public Result<List<Product>> list() {
        List<Product> products = productService.listAll();
        return Result.success(products, "查询成功");
    }
}
