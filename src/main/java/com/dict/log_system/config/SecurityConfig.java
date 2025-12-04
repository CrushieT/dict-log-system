package com.dict.log_system.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.Authentication;

import com.dict.log_system.model.Admin;
import com.dict.log_system.repository.AdminRepository;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    private final AdminRepository adminRepository;

    public SecurityConfig(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    // ✅ Password encoder
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Define UserDetailsService directly here (no extra file)
    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            Admin admin = adminRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

            return User.builder()
                    .username(admin.getEmail())
                    .password(admin.getPassword())
                    .roles(admin.getRole())  // ✅ USE ROLE FROM DATABASE
                    .build();
        };
    }


    // ✅ Authentication provider
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    // ✅ Expose AuthenticationManager Bean (needed for login)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/register", "/api/verify", "/api/login", "/api/visitor").permitAll()
                .requestMatchers("/css/**", "/js/**", "/images/**", "/assets/**").permitAll()
                .requestMatchers("/index.html", "/admin_reg.html", "/visitor_reg.html").permitAll()
                .requestMatchers("/api/admin/**", "/admin_view.html").hasRole("ADMIN")
                .requestMatchers("/api/superuser/**", "/super_view.html").hasRole("SUPERUSER")

                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/index.html").permitAll()
            )
            // ✅ Logout Configuration
            .logout(logout -> logout
                .logoutUrl("/api/logout") // the endpoint frontend will call
                .invalidateHttpSession(true)
                .clearAuthentication(true)
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setStatus(HttpServletResponse.SC_OK);
                    response.getWriter().write("✅ Logged out successfully!");
                })
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated()) {
                        boolean isAdmin = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                        boolean isSuper = auth.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_SUPERUSER"));

                        if (isAdmin) {
                            response.sendRedirect("/admin_view.html");
                        } else if (isSuper) {
                            response.sendRedirect("/super_view.html");
                        } else {
                            response.sendRedirect("/index.html?unauthorized");
                        }
                    } else {
                        response.sendRedirect("/index.html?unauthorized");
                    }
                })
            );

        return http.build();
    }

}
