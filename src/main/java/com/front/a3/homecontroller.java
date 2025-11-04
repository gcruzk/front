package com.front.a3;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class homecontroller {

 @GetMapping("/")
 public String home() {
 return "forward:/index.html";
 }
}
