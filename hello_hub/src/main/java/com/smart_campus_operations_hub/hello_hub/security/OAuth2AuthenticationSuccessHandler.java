package com.smart_campus_operations_hub.hello_hub.security;

import com.smart_campus_operations_hub.hello_hub.model.AppUser;
import com.smart_campus_operations_hub.hello_hub.service.AppUserDetailsService;
import com.smart_campus_operations_hub.hello_hub.service.JwtService;
import com.smart_campus_operations_hub.hello_hub.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.frontend.redirect-uri}")
    private String frontendRedirectUri;

    private final JwtService jwtService;
    private final AppUserDetailsService userDetailsService;
    private final UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        org.springframework.security.core.Authentication authentication)
            throws IOException, ServletException {

        String email = resolveEmail(authentication);
        AppUser user = userService.getByEmail(email);

        if (!userService.isApproved(user)) {
            String redirectUrl = frontendRedirectUri + "/login?approval=pending";
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            return;
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        String role = user.getRole() == null ? "" : user.getRole().name();

        String redirectUrl = frontendRedirectUri
                + "/auth/callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8)
                + "&role=" + URLEncoder.encode(role, StandardCharsets.UTF_8);

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String resolveEmail(org.springframework.security.core.Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oAuth2User) {
            String email = oAuth2User.getAttribute("email");
            if (email != null && !email.isBlank()) {
                return email;
            }
        }

        return authentication.getName();
    }
}
