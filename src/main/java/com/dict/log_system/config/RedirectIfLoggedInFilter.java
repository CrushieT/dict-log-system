package com.dict.log_system.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class RedirectIfLoggedInFilter extends OncePerRequestFilter {

    private static final List<String> BLOCKED_WHEN_LOGGED_IN = List.of(
        "/index.html",
        "/admin_reg.html",
        "/visitor_reg.html"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String path = request.getRequestURI();

        if (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal())
                && BLOCKED_WHEN_LOGGED_IN.contains(path)) {

            // redirect based on role
            if (auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_SUPERUSER"))) {
                response.sendRedirect("/super_view.html");
            } else if (auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
                response.sendRedirect("/admin_view.html");
            } else {
                response.sendRedirect("/index.html");
            }
            return;
        }

        filterChain.doFilter(request, response);
    }
}
