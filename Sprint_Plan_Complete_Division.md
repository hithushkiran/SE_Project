# Sprint Plan: Complete 4-Member Team Division

## **Member 1: Category Management & Recents Page**

### **Goal:**
Member 1's primary responsibility is to implement the **categorization and user navigation system**. This includes enabling users to select research interests during profile editing, assign categories when uploading papers, and maintain a history of recently viewed papers for easy re-access. The member will build the category management infrastructure that allows users to organize and filter content based on research topics, while also providing a recents page that tracks user's paper viewing history. This work establishes the foundation for personalized content discovery and organized browsing throughout the platform.

### **Tasks:**
- Category selection in user profile editing
- Category assignment during paper upload
- Recents page functionality
- Category search/filtering improvements

### **Backend Components:**

#### **APIs to Create/Modify:**

```java
// Add these endpoints to existing ProfileController
@PutMapping("/interests")
public ResponseEntity<?> updateUserInterests(@RequestBody List<Long> categoryIds, Authentication auth) {
    // Update user's research interests/categories
}

@GetMapping("/interests")
public ResponseEntity<List<Category>> getUserInterests(Authentication auth) {
    // Get user's selected categories
}
```

```java
// Add to existing PaperController
@GetMapping("/recent")
public ResponseEntity<List<Paper>> getRecentPapers(Authentication auth) {
    // Get user's recently viewed papers ordered by view date
}
```

#### **New Entities:**
*No new entities required for Member 1's tasks.*

#### **Services to Create/Modify:**

```java
// Add methods to existing ProfileService
public void updateUserInterests(Long userId, List<Long> categoryIds) {
    // Update user-category relationships
    User user = userRepository.findById(userId).orElseThrow();
    List<Category> categories = categoryRepository.findAllById(categoryIds);
    user.setResearchInterests(new HashSet<>(categories));
    userRepository.save(user);
}

public List<Category> getUserInterests(Long userId) {
    // Get user's selected categories
    return userRepository.findById(userId)
        .map(user -> new ArrayList<>(user.getResearchInterests()))
        .orElse(new ArrayList<>());
}
```



#### **Repository Methods to Add:**
*Simple queries for recent papers based on user session data - implementation will coordinate with Member 2's view tracking system.*

### **Frontend Components:**

#### **Components to Create:**

```typescript
export const RecentsPage: React.FC = () => {
    const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchRecentPapers();
    }, []);
    
    const fetchRecentPapers = async () => {
        try {
            const papers = await paperService.getRecentPapers();
            setRecentPapers(papers);
        } catch (error) {
            console.error('Failed to fetch recent papers:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="recents-page">
            <h1>Recently Viewed Papers</h1>
            {loading ? (
                <div>Loading...</div>
            ) : recentPapers.length > 0 ? (
                <div className="papers-grid">
                    {recentPapers.map(paper => (
                        <PaperCard key={paper.id} paper={paper} showViewDate />
                    ))}
                </div>
            ) : (
                <div className="empty-state">
                    <p>No recently viewed papers</p>
                </div>
            )}
        </div>
    );
};
```

```typescript
export const CategorySelector: React.FC<{
    selectedCategories: number[];
    onCategoryChange: (categories: number[]) => void;
    availableCategories: Category[];
}> = ({ selectedCategories, onCategoryChange, availableCategories }) => {
    
    const handleToggleCategory = (categoryId: number) => {
        const isSelected = selectedCategories.includes(categoryId);
        if (isSelected) {
            onCategoryChange(selectedCategories.filter(id => id !== categoryId));
        } else {
            onCategoryChange([...selectedCategories, categoryId]);
        }
    };
    
    return (
        <div className="category-selector">
            <h3>Select Categories</h3>
            <div className="category-chips">
                {availableCategories.map(category => (
                    <div
                        key={category.id}
                        className={`category-chip ${selectedCategories.includes(category.id) ? 'selected' : ''}`}
                        onClick={() => handleToggleCategory(category.id)}
                    >
                        {category.name}
                    </div>
                ))}
            </div>
        </div>
    );
};
```



#### **Components to Modify:**

#### **Components to Modify:**
*Member 1 will modify existing profile and paper upload forms to integrate category selection functionality. View tracking integration will be handled by Member 2.*

#### **Services to Create/Modify:**

```typescript
// Add to existing paperService
const getRecentPapers = async (): Promise<Paper[]> => {
    try {
        const response = await api.get('/papers/recent');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch recent papers:', error);
        throw error;
    }
};

// Add to existing categoryService
const getUserInterests = async (): Promise<Category[]> => {
    try {
        const response = await api.get('/profile/interests');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user interests:', error);
        throw error;
    }
};

const updateUserInterests = async (categoryIds: number[]): Promise<void> => {
    try {
        await api.put('/profile/interests', categoryIds);
    } catch (error) {
        console.error('Failed to update user interests:', error);
        throw error;
    }
};

export { getRecentPapers, getUserInterests, updateUserInterests };
```

---

## **Member 2: Library Functionality & View Tracking**

### **Goal:**
Member 2 focuses on implementing the **personal library and paper engagement features**. This involves creating a comprehensive system where users can save papers to their personal collections, manage their saved content, and track paper engagement metrics. The member will build both the backend infrastructure for library management and the view tracking system that monitors paper access patterns. This work enables users to build personalized research collections while providing valuable insights into paper popularity and user engagement across the platform.

### **Tasks:**
- Complete library backend-frontend integration
- Library page implementation
- Add/remove from library in explore and paper details
- **Paper view tracking and statistics system**
- **View count display in paper cards and details**
- **Paper statistics API (total views, unique viewers, etc.)**

### **Backend Components:**

#### **APIs to Create/Modify:**

```java
@RestController
@RequestMapping("/api/library")
public class LibraryController {
    
    @PostMapping("/add/{paperId}")
    public ResponseEntity<?> addToLibrary(@PathVariable Long paperId, Authentication auth) {
        try {
            String email = auth.getName();
            User user = userService.findByEmail(email);
            libraryService.addToLibrary(user.getId(), paperId);
            return ResponseEntity.ok().body(Map.of("message", "Paper added to library"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/remove/{paperId}")
    public ResponseEntity<?> removeFromLibrary(@PathVariable Long paperId, Authentication auth) {
        try {
            String email = auth.getName();
            User user = userService.findByEmail(email);
            libraryService.removeFromLibrary(user.getId(), paperId);
            return ResponseEntity.ok().body(Map.of("message", "Paper removed from library"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Paper>> getUserLibrary(Authentication auth) {
        try {
            String email = auth.getName();
            User user = userService.findByEmail(email);
            List<Paper> libraryPapers = libraryService.getUserLibrary(user.getId());
            return ResponseEntity.ok(libraryPapers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/check/{paperId}")
    public ResponseEntity<Boolean> isInLibrary(@PathVariable Long paperId, Authentication auth) {
        try {
            String email = auth.getName();
            User user = userService.findByEmail(email);
            boolean inLibrary = libraryService.isInLibrary(user.getId(), paperId);
            return ResponseEntity.ok(inLibrary);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }
}
```

#### **New Entity:**

```java
@Entity
@Table(name = "user_library")
public class UserLibrary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "paper_id")
    private Paper paper;
    
    @Column(name = "added_at")
    private LocalDateTime addedAt;
    
    // constructors, getters, setters
}
```

#### **Services to Create:**

```java
@Service
public class LibraryService {
    
    private final UserLibraryRepository userLibraryRepository;
    private final UserRepository userRepository;
    private final PaperRepository paperRepository;
    
    public void addToLibrary(Long userId, Long paperId) {
        if (!isInLibrary(userId, paperId)) {
            User user = userRepository.findById(userId).orElseThrow();
            Paper paper = paperRepository.findById(paperId).orElseThrow();
            
            UserLibrary userLibrary = new UserLibrary();
            userLibrary.setUser(user);
            userLibrary.setPaper(paper);
            userLibrary.setAddedAt(LocalDateTime.now());
            
            userLibraryRepository.save(userLibrary);
        }
    }
    
    public void removeFromLibrary(Long userId, Long paperId) {
        userLibraryRepository.deleteByUserIdAndPaperId(userId, paperId);
    }
    
    public List<Paper> getUserLibrary(Long userId) {
        return userLibraryRepository.findPapersByUserId(userId);
    }
    
    public boolean isInLibrary(Long userId, Long paperId) {
        return userLibraryRepository.existsByUserIdAndPaperId(userId, paperId);
    }
}
```

#### **Repository to Create:**

```java
@Repository
public interface UserLibraryRepository extends JpaRepository<UserLibrary, Long> {
    
    @Query("SELECT ul.paper FROM UserLibrary ul WHERE ul.user.id = :userId ORDER BY ul.addedAt DESC")
    List<Paper> findPapersByUserId(@Param("userId") Long userId);
    
    boolean existsByUserIdAndPaperId(Long userId, Long paperId);
    
    void deleteByUserIdAndPaperId(Long userId, Long paperId);
}
```

### **Frontend Components:**

#### **Components to Create:**

```typescript
export const LibraryPage: React.FC = () => {
    const [libraryPapers, setLibraryPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        fetchLibraryPapers();
    }, []);
    
    const fetchLibraryPapers = async () => {
        try {
            setLoading(true);
            const papers = await libraryService.getUserLibrary();
            setLibraryPapers(papers);
        } catch (error) {
            setError('Failed to fetch library papers');
            console.error('Library fetch error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleRemoveFromLibrary = async (paperId: number) => {
        try {
            await libraryService.removeFromLibrary(paperId);
            setLibraryPapers(papers => papers.filter(p => p.id !== paperId));
        } catch (error) {
            setError('Failed to remove paper from library');
        }
    };
    
    if (loading) return <div className="loading">Loading your library...</div>;
    if (error) return <div className="error">{error}</div>;
    
    return (
        <div className="library-page">
            <header className="library-header">
                <h1>My Library</h1>
                <p>{libraryPapers.length} papers saved</p>
            </header>
            
            {libraryPapers.length === 0 ? (
                <div className="empty-library">
                    <h3>Your library is empty</h3>
                    <p>Start adding papers to build your research collection</p>
                    <Link to="/explore" className="btn-primary">Explore Papers</Link>
                </div>
            ) : (
                <div className="library-grid">
                    {libraryPapers.map(paper => (
                        <div key={paper.id} className="library-paper-card">
                            <PaperCard paper={paper} />
                            <button 
                                className="remove-btn"
                                onClick={() => handleRemoveFromLibrary(paper.id)}
                            >
                                Remove from Library
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
```

```typescript
export const LibraryButton: React.FC<{
    paperId: number;
    className?: string;
}> = ({ paperId, className = '' }) => {
    const [isInLibrary, setIsInLibrary] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    
    useEffect(() => {
        if (user) {
            checkLibraryStatus();
        }
    }, [paperId, user]);
    
    const checkLibraryStatus = async () => {
        try {
            const inLibrary = await libraryService.isInLibrary(paperId);
            setIsInLibrary(inLibrary);
        } catch (error) {
            console.error('Failed to check library status:', error);
        }
    };
    
    const handleToggle = async () => {
        if (!user) {
            // Redirect to login or show message
            return;
        }
        
        setLoading(true);
        try {
            if (isInLibrary) {
                await libraryService.removeFromLibrary(paperId);
                setIsInLibrary(false);
            } else {
                await libraryService.addToLibrary(paperId);
                setIsInLibrary(true);
            }
        } catch (error) {
            console.error('Failed to toggle library status:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (!user) return null;
    
    return (
        <button
            className={`library-btn ${isInLibrary ? 'in-library' : 'not-in-library'} ${className}`}
            onClick={handleToggle}
            disabled={loading}
        >
            {loading ? (
                <span>...</span>
            ) : (
                <>
                    <i className={`icon ${isInLibrary ? 'icon-bookmark-filled' : 'icon-bookmark'}`} />
                    {isInLibrary ? 'In Library' : 'Add to Library'}
                </>
            )}
        </button>
    );
};
```

#### **Services to Create:**

```typescript
// Create libraryService.ts
class LibraryService {
    async addToLibrary(paperId: number): Promise<void> {
        try {
            await api.post(`/library/add/${paperId}`);
        } catch (error) {
            console.error('Failed to add to library:', error);
            throw error;
        }
    }
    
    async removeFromLibrary(paperId: number): Promise<void> {
        try {
            await api.delete(`/library/remove/${paperId}`);
        } catch (error) {
            console.error('Failed to remove from library:', error);
            throw error;
        }
    }
    
    async getUserLibrary(): Promise<Paper[]> {
        try {
            const response = await api.get('/library');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch library:', error);
            throw error;
        }
    }
    
    async isInLibrary(paperId: number): Promise<boolean> {
        try {
            const response = await api.get(`/library/check/${paperId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to check library status:', error);
            return false;
        }
    }
}

export const libraryService = new LibraryService();
```

---

## **Member 3: Admin Moderation System**

### **Goal:**
Member 3 is responsible for implementing the **content quality and platform governance system**. This involves building a comprehensive admin dashboard that enables platform administrators to moderate user-generated content, manage user accounts, and ensure platform quality standards. The member will create the paper approval workflow that requires admin review before papers become publicly visible, implement user management capabilities for handling problematic accounts, and develop comment moderation tools. This work is crucial for maintaining the credibility and academic integrity of the research platform by ensuring only legitimate, high-quality content is published.

### **Tasks:**
- Admin dashboard with user, paper, and comment moderation
- Paper approval workflow
- Admin-only routes and permissions

### **Backend Components:**

#### **APIs to Create:**

```java
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    private final NotificationService notificationService;
    
    // Paper Moderation
    @GetMapping("/papers/pending")
    public ResponseEntity<Page<Paper>> getPendingPapers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Paper> pendingPapers = adminService.getPendingPapers(pageable);
        return ResponseEntity.ok(pendingPapers);
    }
    
    @PutMapping("/papers/{paperId}/approve")
    public ResponseEntity<?> approvePaper(@PathVariable Long paperId, Authentication auth) {
        try {
            Paper paper = adminService.approvePaper(paperId);
            notificationService.notifyPaperApproval(paper);
            return ResponseEntity.ok().body(Map.of("message", "Paper approved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/papers/{paperId}/reject")
    public ResponseEntity<?> rejectPaper(
            @PathVariable Long paperId, 
            @RequestBody Map<String, String> request,
            Authentication auth) {
        try {
            String reason = request.get("reason");
            Paper paper = adminService.rejectPaper(paperId, reason);
            notificationService.notifyPaperRejection(paper, reason);
            return ResponseEntity.ok().body(Map.of("message", "Paper rejected successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // User Moderation
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = adminService.getAllUsers(pageable, search);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            adminService.suspendUser(userId, reason);
            return ResponseEntity.ok().body(Map.of("message", "User suspended successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        try {
            adminService.activateUser(userId);
            return ResponseEntity.ok().body(Map.of("message", "User activated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Comment Moderation
    @GetMapping("/comments/flagged")
    public ResponseEntity<Page<Comment>> getFlaggedComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> flaggedComments = adminService.getFlaggedComments(pageable);
        return ResponseEntity.ok(flaggedComments);
    }
    
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId, @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            adminService.deleteComment(commentId, reason);
            return ResponseEntity.ok().body(Map.of("message", "Comment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/comments/{commentId}/flag")
    public ResponseEntity<?> flagComment(@PathVariable Long commentId, Authentication auth) {
        try {
            adminService.flagComment(commentId);
            return ResponseEntity.ok().body(Map.of("message", "Comment flagged for review"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // Admin Dashboard Stats
    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getAdminStats() {
        AdminStats stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }
}
```

#### **Entities to Modify:**

```java
// Add to existing Paper entity
public enum PaperStatus {
    PENDING, APPROVED, REJECTED
}

@Enumerated(EnumType.STRING)
@Column(name = "status")
private PaperStatus status = PaperStatus.PENDING;

@Column(name = "rejection_reason")
private String rejectionReason;

@Column(name = "reviewed_at")
private LocalDateTime reviewedAt;

@Column(name = "reviewed_by")
private Long reviewedBy; // Admin user ID
```

```java
// Add to existing User entity
@Column(name = "is_suspended")
private boolean isSuspended = false;

@Column(name = "suspension_reason")
private String suspensionReason;

@Column(name = "suspended_at")
private LocalDateTime suspendedAt;
```

```java
// Add to existing Comment entity
@Column(name = "is_flagged")
private boolean isFlagged = false;

@Column(name = "flagged_at")
private LocalDateTime flaggedAt;

@Column(name = "flag_reason")
private String flagReason;
```

#### **New DTOs:**

```java
public class AdminStats {
    private long totalUsers;
    private long totalPapers;
    private long pendingPapers;
    private long rejectedPapers;
    private long flaggedComments;
    private long suspendedUsers;
    
    // constructors, getters, setters
}
```

#### **Services to Create:**

```java
@Service
public class AdminService {
    
    public Page<Paper> getPendingPapers(Pageable pageable) {
        return paperRepository.findByStatus(PaperStatus.PENDING, pageable);
    }
    
    public Paper approvePaper(Long paperId) {
        Paper paper = paperRepository.findById(paperId).orElseThrow();
        paper.setStatus(PaperStatus.APPROVED);
        paper.setReviewedAt(LocalDateTime.now());
        return paperRepository.save(paper);
    }
    
    public Paper rejectPaper(Long paperId, String reason) {
        Paper paper = paperRepository.findById(paperId).orElseThrow();
        paper.setStatus(PaperStatus.REJECTED);
        paper.setRejectionReason(reason);
        paper.setReviewedAt(LocalDateTime.now());
        return paperRepository.save(paper);
    }
    
    public Page<User> getAllUsers(Pageable pageable, String search) {
        if (search != null && !search.isEmpty()) {
            return userRepository.findByEmailContainingOrFullNameContaining(search, search, pageable);
        }
        return userRepository.findAll(pageable);
    }
    
    public void suspendUser(Long userId, String reason) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setSuspended(true);
        user.setSuspensionReason(reason);
        user.setSuspendedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setSuspended(false);
        user.setSuspensionReason(null);
        user.setSuspendedAt(null);
        userRepository.save(user);
    }
    
    public Page<Comment> getFlaggedComments(Pageable pageable) {
        return commentRepository.findByIsFlagged(true, pageable);
    }
    
    public void deleteComment(Long commentId, String reason) {
        commentRepository.deleteById(commentId);
        // Log deletion reason if needed
    }
    
    public void flagComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow();
        comment.setFlagged(true);
        comment.setFlaggedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }
    
    public AdminStats getAdminStats() {
        return new AdminStats(
            userRepository.count(),
            paperRepository.count(),
            paperRepository.countByStatus(PaperStatus.PENDING),
            paperRepository.countByStatus(PaperStatus.REJECTED),
            commentRepository.countByIsFlagged(true),
            userRepository.countByIsSuspended(true)
        );
    }
}
```

### **Frontend Components:**

#### **Components to Create:**

```typescript
export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    
    useEffect(() => {
        fetchAdminStats();
    }, []);
    
    const fetchAdminStats = async () => {
        try {
            const adminStats = await adminService.getStats();
            setStats(adminStats);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
        }
    };
    
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'papers', label: 'Papers' },
        { id: 'users', label: 'Users' },
        { id: 'comments', label: 'Comments' }
    ];
    
    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
            </header>
            
            <nav className="admin-nav">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            
            <div className="admin-content">
                {activeTab === 'overview' && stats && (
                    <AdminOverview stats={stats} />
                )}
                {activeTab === 'papers' && <PaperModerationTable />}
                {activeTab === 'users' && <UserModerationTable />}
                {activeTab === 'comments' && <CommentModerationTable />}
            </div>
        </div>
    );
};
```

```typescript
export const PaperModerationTable: React.FC = () => {
    const [pendingPapers, setPendingPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
    
    useEffect(() => {
        fetchPendingPapers();
    }, []);
    
    const fetchPendingPapers = async () => {
        try {
            const papers = await adminService.getPendingPapers();
            setPendingPapers(papers.content);
        } catch (error) {
            console.error('Failed to fetch pending papers:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleApprovePaper = async (paperId: number) => {
        try {
            await adminService.approvePaper(paperId);
            setPendingPapers(papers => papers.filter(p => p.id !== paperId));
        } catch (error) {
            console.error('Failed to approve paper:', error);
        }
    };
    
    const handleRejectPaper = async (paperId: number, reason: string) => {
        try {
            await adminService.rejectPaper(paperId, reason);
            setPendingPapers(papers => papers.filter(p => p.id !== paperId));
        } catch (error) {
            console.error('Failed to reject paper:', error);
        }
    };
    
    return (
        <div className="moderation-table">
            <h2>Pending Papers ({pendingPapers.length})</h2>
            
            {loading ? (
                <div>Loading...</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingPapers.map(paper => (
                            <PaperModerationRow
                                key={paper.id}
                                paper={paper}
                                onApprove={handleApprovePaper}
                                onReject={handleRejectPaper}
                                onView={setSelectedPaper}
                            />
                        ))}
                    </tbody>
                </table>
            )}
            
            {selectedPaper && (
                <PaperPreviewModal
                    paper={selectedPaper}
                    onClose={() => setSelectedPaper(null)}
                />
            )}
        </div>
    );
};
```

---

## **Member 4: My Publications & Threaded Comments & Email Verification**

### **Goal:**
Member 4 handles the **user engagement and authentication security features**. This includes building the author dashboard where users can track their uploaded papers and their status (pending, approved, rejected), implementing a sophisticated threaded comment system that enables structured academic discussions, and establishing robust email verification to ensure user authenticity. The member will create nested comment functionality that supports replies and maintains conversation threads, while also implementing email domain validation to verify that users are providing legitimate email addresses. This work enhances user interaction capabilities and strengthens platform security by ensuring verified user identities.

### **Tasks:**
- My Publications page showing user's uploaded papers
- Threaded comment system with replies
- Email verification system for user authentication

### **Backend Components:**

#### **APIs to Create/Modify:**

```java
// Add to existing controller or create new
@GetMapping("/{userId}/publications")
public ResponseEntity<List<Paper>> getUserPublications(@PathVariable Long userId, Authentication auth) {
    try {
        List<Paper> publications = paperService.getPapersByAuthor(userId);
        return ResponseEntity.ok(publications);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}

@GetMapping("/my-publications")
public ResponseEntity<List<Paper>> getMyPublications(Authentication auth) {
    try {
        String email = auth.getName();
        User user = userService.findByEmail(email);
        List<Paper> publications = paperService.getPapersByAuthor(user.getId());
        return ResponseEntity.ok(publications);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}
```

```java
// Modify existing comment endpoints
@PostMapping("/papers/{paperId}/comments/{parentId}/reply")
public ResponseEntity<Comment> addReply(
    @PathVariable Long paperId, 
    @PathVariable Long parentId,
    @RequestBody CommentRequest request, 
    Authentication auth) {
    try {
        String email = auth.getName();
        User user = userService.findByEmail(email);
        Comment reply = commentService.addReply(paperId, parentId, request.getContent(), user.getId());
        return ResponseEntity.ok(reply);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}

@GetMapping("/papers/{paperId}/comments/threaded")
public ResponseEntity<List<CommentThread>> getThreadedComments(@PathVariable Long paperId) {
    try {
        List<CommentThread> threads = commentService.getThreadedComments(paperId);
        return ResponseEntity.ok(threads);
    } catch (Exception e) {
        return ResponseEntity.badRequest().build();
    }
}
```

```java
// Add to existing AuthController
@PostMapping("/verify-email")
public ResponseEntity<?> verifyEmail(@RequestParam String token) {
    try {
        boolean verified = emailVerificationService.verifyToken(token);
        if (verified) {
            return ResponseEntity.ok().body(Map.of("message", "Email verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

@PostMapping("/resend-verification")
public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        emailVerificationService.resendVerificationEmail(email);
        return ResponseEntity.ok().body(Map.of("message", "Verification email sent"));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

@PostMapping("/check-email")
public ResponseEntity<Boolean> checkEmailExists(@RequestBody Map<String, String> request) {
    try {
        String email = request.get("email");
        boolean isValid = emailService.isValidEmailDomain(email);
        return ResponseEntity.ok(isValid);
    } catch (Exception e) {
        return ResponseEntity.ok(false);
    }
}
```

#### **Entities to Modify:**

```java
// Add to existing Comment entity
@ManyToOne
@JoinColumn(name = "parent_comment_id")
private Comment parentComment;

@OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<Comment> replies = new ArrayList<>();

public void addReply(Comment reply) {
    replies.add(reply);
    reply.setParentComment(this);
}
```

```java
// Add to existing User entity
@Column(name = "email_verified")
private boolean emailVerified = false;

@Column(name = "verification_token")
private String verificationToken;

@Column(name = "verification_token_expires")
private LocalDateTime verificationTokenExpires;
```

#### **New DTOs:**

```java
public class CommentThread {
    private Comment comment;
    private List<CommentThread> replies;
    
    // constructors, getters, setters
}
```

#### **Services to Create/Modify:**

```java
// Modify existing CommentService
public Comment addReply(Long paperId, Long parentId, String content, Long userId) {
    Comment parentComment = commentRepository.findById(parentId).orElseThrow();
    Paper paper = paperRepository.findById(paperId).orElseThrow();
    User user = userRepository.findById(userId).orElseThrow();
    
    Comment reply = new Comment();
    reply.setContent(content);
    reply.setPaper(paper);
    reply.setAuthor(user);
    reply.setParentComment(parentComment);
    reply.setCreatedAt(LocalDateTime.now());
    
    return commentRepository.save(reply);
}

public List<CommentThread> getThreadedComments(Long paperId) {
    List<Comment> topLevelComments = commentRepository.findByPaperIdAndParentCommentIsNull(paperId);
    return topLevelComments.stream()
        .map(this::buildCommentThread)
        .collect(Collectors.toList());
}

private CommentThread buildCommentThread(Comment comment) {
    CommentThread thread = new CommentThread();
    thread.setComment(comment);
    
    List<CommentThread> replyThreads = comment.getReplies().stream()
        .map(this::buildCommentThread)
        .collect(Collectors.toList());
    thread.setReplies(replyThreads);
    
    return thread;
}
```

```java
// Create new EmailService
@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend.url}")
    private String frontendUrl;
    
    public void sendVerificationEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(email);
            helper.setSubject("Verify Your Email - ResearchHub");
            
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
            String htmlContent = buildVerificationEmailContent(verificationUrl);
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
    
    public boolean isValidEmailDomain(String email) {
        try {
            String domain = email.substring(email.lastIndexOf("@") + 1);
            
            // Basic DNS lookup to check if domain exists
            InetAddress.getByName(domain);
            
            // Check common patterns
            return email.matches("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$");
        } catch (Exception e) {
            return false;
        }
    }
    
    public boolean isInstitutionalEmail(String email) {
        String domain = email.substring(email.lastIndexOf("@") + 1).toLowerCase();
        
        // Common academic domain patterns
        return domain.endsWith(".edu") || 
               domain.endsWith(".ac.uk") || 
               domain.endsWith(".ac.in") ||
               domain.contains("university") ||
               domain.contains("college");
    }
    
    private String buildVerificationEmailContent(String verificationUrl) {
        return """
            <html>
            <body>
                <h2>Welcome to ResearchHub!</h2>
                <p>Thank you for registering. Please click the link below to verify your email address:</p>
                <a href="%s" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p>If you didn't create this account, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
            </body>
            </html>
            """.formatted(verificationUrl);
    }
}
```

```java
// Create new EmailVerificationService
@Service
public class EmailVerificationService {
    
    private final UserRepository userRepository;
    private final EmailService emailService;
    
    public String generateVerificationToken(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpires(LocalDateTime.now().plusHours(24));
        
        userRepository.save(user);
        return token;
    }
    
    public boolean verifyToken(String token) {
        Optional<User> userOpt = userRepository.findByVerificationToken(token);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        if (user.getVerificationTokenExpires().isBefore(LocalDateTime.now())) {
            return false; // Token expired
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpires(null);
        userRepository.save(user);
        
        return true;
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        String token = generateVerificationToken(user.getId());
        emailService.sendVerificationEmail(email, token);
    }
}
```

### **Frontend Components:**

#### **Components to Create:**

```typescript
export const MyPublicationsPage: React.FC = () => {
    const [publications, setPublications] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    
    useEffect(() => {
        fetchMyPublications();
    }, []);
    
    const fetchMyPublications = async () => {
        try {
            const papers = await paperService.getMyPublications();
            setPublications(papers);
        } catch (error) {
            console.error('Failed to fetch publications:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const filteredPublications = publications.filter(paper => {
        if (filter === 'all') return true;
        return paper.status?.toLowerCase() === filter;
    });
    
    const getStatusBadge = (status: string) => {
        const statusClass = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected'
        }[status] || 'status-unknown';
        
        return <span className={`status-badge ${statusClass}`}>{status}</span>;
    };
    
    return (
        <div className="publications-page">
            <header className="publications-header">
                <h1>My Publications</h1>
                <div className="filter-buttons">
                    {['all', 'pending', 'approved', 'rejected'].map(filterType => (
                        <button
                            key={filterType}
                            className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                            onClick={() => setFilter(filterType as any)}
                        >
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        </button>
                    ))}
                </div>
            </header>
            
            {loading ? (
                <div className="loading">Loading your publications...</div>
            ) : filteredPublications.length === 0 ? (
                <div className="empty-state">
                    <h3>No publications found</h3>
                    <p>Upload your first research paper to get started</p>
                    <Link to="/publish" className="btn-primary">Upload Paper</Link>
                </div>
            ) : (
                <div className="publications-list">
                    {filteredPublications.map(paper => (
                        <div key={paper.id} className="publication-card">
                            <div className="paper-info">
                                <h3>{paper.title}</h3>
                                <p className="paper-abstract">{paper.abstract}</p>
                                <div className="paper-meta">
                                    <span>Uploaded: {formatDate(paper.uploadDate)}</span>
                                    {getStatusBadge(paper.status)}
                                </div>
                                {paper.rejectionReason && (
                                    <div className="rejection-reason">
                                        <strong>Rejection Reason:</strong> {paper.rejectionReason}
                                    </div>
                                )}
                            </div>
                            <div className="paper-actions">
                                <Link to={`/papers/${paper.id}`} className="btn-secondary">
                                    View Details
                                </Link>
                                {paper.status === 'APPROVED' && (
                                    <span className="view-count">{paper.viewCount || 0} views</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
```

```typescript
export const ThreadedCommentSection: React.FC<{
    paperId: number;
}> = ({ paperId }) => {
    const [commentThreads, setCommentThreads] = useState<CommentThread[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    useEffect(() => {
        fetchComments();
    }, [paperId]);
    
    const fetchComments = async () => {
        try {
            const threads = await commentService.getThreadedComments(paperId);
            setCommentThreads(threads);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;
        
        try {
            await commentService.addComment(paperId, newComment);
            setNewComment('');
            await fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };
    
    const handleAddReply = async (parentId: number, content: string) => {
        try {
            await commentService.addReply(paperId, parentId, content);
            await fetchComments(); // Refresh comments
        } catch (error) {
            console.error('Failed to add reply:', error);
        }
    };
    
    return (
        <div className="threaded-comments">
            <h3>Comments ({commentThreads.length})</h3>
            
            {user && (
                <form onSubmit={handleSubmitComment} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        required
                    />
                    <button type="submit" className="btn-primary">
                        Post Comment
                    </button>
                </form>
            )}
            
            {loading ? (
                <div className="loading">Loading comments...</div>
            ) : commentThreads.length === 0 ? (
                <div className="no-comments">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="comment-threads">
                    {commentThreads.map(thread => (
                        <CommentThreadComponent
                            key={thread.comment.id}
                            thread={thread}
                            onReply={handleAddReply}
                            depth={0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
```

```typescript
export const CommentThreadComponent: React.FC<{
    thread: CommentThread;
    onReply: (parentId: number, content: string) => void;
    depth: number;
}> = ({ thread, onReply, depth }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const { user } = useAuth();
    
    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        
        await onReply(thread.comment.id, replyContent);
        setReplyContent('');
        setShowReplyForm(false);
    };
    
    return (
        <div className={`comment-thread depth-${Math.min(depth, 5)}`}>
            <div className="comment-content">
                <div className="comment-header">
                    <span className="author-name">{thread.comment.author.fullName}</span>
                    <span className="comment-date">{formatDate(thread.comment.createdAt)}</span>
                </div>
                <p className="comment-text">{thread.comment.content}</p>
                <div className="comment-actions">
                    {user && (
                        <button 
                            className="reply-btn"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            Reply
                        </button>
                    )}
                </div>
            </div>
            
            {showReplyForm && (
                <form onSubmit={handleSubmitReply} className="reply-form">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        required
                    />
                    <div className="reply-actions">
                        <button type="submit" className="btn-primary btn-sm">
                            Reply
                        </button>
                        <button 
                            type="button" 
                            className="btn-secondary btn-sm"
                            onClick={() => setShowReplyForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            
            {thread.replies.length > 0 && (
                <div className="comment-replies">
                    {thread.replies.map(replyThread => (
                        <CommentThreadComponent
                            key={replyThread.comment.id}
                            thread={replyThread}
                            onReply={onReply}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
```

```typescript
export const EmailVerificationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [error, setError] = useState<string>('');
    
    useEffect(() => {
        if (token) {
            verifyEmail();
        }
    }, [token]);
    
    const verifyEmail = async () => {
        try {
            const success = await authService.verifyEmail(token!);
            setVerificationStatus(success ? 'success' : 'error');
            if (!success) {
                setError('Invalid or expired verification token');
            }
        } catch (error) {
            setVerificationStatus('error');
            setError('Verification failed. Please try again.');
        }
    };
    
    return (
        <div className="verification-page">
            <div className="verification-container">
                {verificationStatus === 'verifying' && (
                    <div className="verifying">
                        <div className="spinner"></div>
                        <h2>Verifying your email...</h2>
                    </div>
                )}
                
                {verificationStatus === 'success' && (
                    <div className="success">
                        <div className="success-icon">✓</div>
                        <h2>Email Verified Successfully!</h2>
                        <p>Your account has been verified. You can now log in.</p>
                        <Link to="/login" className="btn-primary">
                            Go to Login
                        </Link>
                    </div>
                )}
                
                {verificationStatus === 'error' && (
                    <div className="error">
                        <div className="error-icon">✗</div>
                        <h2>Verification Failed</h2>
                        <p>{error}</p>
                        <Link to="/login" className="btn-secondary">
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
```

---

## **Implementation Timeline:**

### **Week 1: Backend Foundation**
- All members: Set up database entities and repositories
- Create and test API endpoints with proper authentication
- Implement core business logic services

### **Week 2: Frontend Components**
- All members: Create React components and pages
- Implement state management and API integration
- Style components with CSS

### **Week 3: Integration & Testing**
- End-to-end testing of all features
- Bug fixes and performance optimizations
- Cross-feature integration testing

### **Week 4: Final Polish & Deployment**
- UI/UX refinements
- Code review and documentation
- Deployment preparation and final testing

---

## **Security Considerations:**

### **Authentication & Authorization:**
- JWT token validation on all protected endpoints
- Role-based access control for admin features
- Email verification for account security

### **Data Validation:**
- Input sanitization to prevent XSS attacks
- SQL injection prevention with parameterized queries
- File upload validation and size limits

### **Privacy:**
- User data protection and GDPR compliance
- Secure password storage with BCrypt
- Audit trail for admin actions

---

This comprehensive plan ensures balanced workload distribution while maintaining feature cohesion and system integrity. Each member has a mix of backend API development, frontend component creation, and integration responsibilities.