package com.researchhub.backend.repository;

import com.researchhub.backend.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUserId(UUID userId);

    @Query("SELECT p FROM Profile p LEFT JOIN FETCH p.interests WHERE p.userId = :userId")
    Optional<Profile> findByUserIdWithInterests(@Param("userId") UUID userId);

    boolean existsByUserId(UUID userId);
}
