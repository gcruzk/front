package com.front.a3;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
@Controller
public class homecontroller {

 @GetMapping("/")
 public String home() {
 return "forward:/index.html";
 }
}
