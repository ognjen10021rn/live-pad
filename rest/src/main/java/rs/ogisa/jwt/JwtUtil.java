package rs.ogisa.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import rs.ogisa.models.AuthenticationDetails;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
    // private final String SECRET_KEY = "BATMAN";
    //
    // public Claims extractAllClaims(String token) {
    // return
    // Jwts.parser().setSigningKey(SECRET_KEY).parseClaimsJws(token).getBody();
    // }
    //
    // public String extractUsername(String token) {
    // return extractAllClaims(token).getSubject();
    // }
    //
    // public boolean isTokenExpired(String token) {
    // return extractAllClaims(token).getExpiration().before(new Date());
    // }
    //
    // public String generateToken(AuthenticationDetails authenticationDetails) {
    // Map<String, Object> claims = new HashMap<>();
    //
    // if (authenticationDetails instanceof UserDto) {
    // claims.put("id", authenticationDetails.getUserId());
    // claims.put("username", authenticationDetails.getUsername());
    // }
    //
    // return Jwts.builder()
    // .setClaims(claims)
    // .setSubject(authenticationDetails.getUsername())
    // .setIssuedAt(new Date(System.currentTimeMillis()))
    // .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
    // .signWith(SignatureAlgorithm.HS512, SECRET_KEY).compact();
    // }
    //
    // public boolean validateToken(String token, UserDetails user) {
    // return (user.getUsername().equals(extractUsername(token)) &&
    // !isTokenExpired(token));
    // }

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(AuthenticationDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("id", userDetails.getUserId())
                .claim("username", userDetails.getUsername())
                .claim("role", userDetails.getRole())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        Claims claims = extractClaims(token);
        Long userId = claims.get("id", Long.class);
        if (userId != null) {
            return userId;
        }
        return claims.get("userId", Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}