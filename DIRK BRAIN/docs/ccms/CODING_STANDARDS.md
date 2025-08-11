# CrawlZilla Coding Standards
## DIRK Enterprise C++ Development Guidelines

**Last Updated**: 2025-07-11  
**Version**: 1.0  
**Applies To**: C++20, CMake, Testing  

## Core Principles

### 1. Safety First (DIRK Principle #1 - Systematic Doubt)
- **Memory Safety**: Use RAII, smart pointers, avoid raw pointers
- **Thread Safety**: Explicit synchronization, prefer immutable data
- **Type Safety**: Strong typing, avoid implicit conversions
- **Input Validation**: Validate all external inputs, bounds checking

### 2. Performance by Design (DIRK Principle #4 - Empirical Grounding)
- **Zero-Copy**: Minimize unnecessary data copying
- **Move Semantics**: Implement move constructors and assignment
- **Algorithmic Efficiency**: O(log n) or better where possible
- **Memory Locality**: Consider cache-friendly data structures

### 3. Clarity and Maintainability (DIRK Principle #8 - Cognitive Awareness)
- **Self-Documenting Code**: Clear naming, logical structure
- **Minimal Complexity**: Avoid clever code, prefer readability
- **Consistent Style**: Follow established patterns
- **Comprehensive Documentation**: API docs, design rationale

## C++ Language Guidelines

### Naming Conventions

```cpp
// Classes: PascalCase
class HttpClient {};
class UrlParser {};

// Functions/Methods: camelCase
void parseUrl(const std::string& url);
bool isValidDomain(std::string_view domain);

// Variables: camelCase
std::string baseUrl;
int maxRetries;

// Constants: UPPER_SNAKE_CASE
constexpr int MAX_CONCURRENT_REQUESTS = 100;
constexpr std::string_view DEFAULT_USER_AGENT = "CrawlZilla/1.0";

// Private members: trailing underscore
class CrawlerEngine {
private:
    std::atomic<bool> isRunning_;
    std::unique_ptr<ThreadPool> threadPool_;
};

// Namespaces: snake_case
namespace crawlzilla::http {}
namespace crawlzilla::url {}
```

### Memory Management

```cpp
// Prefer smart pointers over raw pointers
std::unique_ptr<HttpClient> client = std::make_unique<HttpClient>();
std::shared_ptr<UrlQueue> queue = std::make_shared<UrlQueue>();

// Use RAII for resource management
class FileHandle {
public:
    explicit FileHandle(const std::string& filename) 
        : file_(std::fopen(filename.c_str(), "r")) {
        if (!file_) {
            throw std::runtime_error("Failed to open file: " + filename);
        }
    }
    
    ~FileHandle() {
        if (file_) {
            std::fclose(file_);
        }
    }
    
    // Delete copy, enable move
    FileHandle(const FileHandle&) = delete;
    FileHandle& operator=(const FileHandle&) = delete;
    FileHandle(FileHandle&& other) noexcept : file_(other.file_) {
        other.file_ = nullptr;
    }
    
private:
    std::FILE* file_;
};
```

### Error Handling

```cpp
// Use exceptions for exceptional cases
class CrawlerException : public std::exception {
public:
    explicit CrawlerException(std::string message) 
        : message_(std::move(message)) {}
    
    const char* what() const noexcept override {
        return message_.c_str();
    }
    
private:
    std::string message_;
};

// Use std::expected for recoverable errors (C++23) or Result<T, E> pattern
template<typename T, typename E>
class Result {
public:
    // Implementation details...
    bool isSuccess() const noexcept;
    const T& value() const;
    const E& error() const;
};

Result<std::string, std::string> parseUrl(std::string_view input);
```

### Thread Safety

```cpp
// Prefer immutable data structures
class ImmutableUrlSet {
public:
    ImmutableUrlSet add(const std::string& url) const;
    bool contains(const std::string& url) const;
    
private:
    std::shared_ptr<const std::unordered_set<std::string>> urls_;
};

// Use std::atomic for simple shared state
class CrawlerStats {
public:
    void incrementProcessed() noexcept {
        processedCount_.fetch_add(1, std::memory_order_relaxed);
    }
    
    std::size_t getProcessedCount() const noexcept {
        return processedCount_.load(std::memory_order_acquire);
    }
    
private:
    std::atomic<std::size_t> processedCount_{0};
};

// Use mutex for complex shared state
class ThreadSafeQueue {
public:
    void push(std::string item) {
        std::lock_guard<std::mutex> lock(mutex_);
        queue_.push(std::move(item));
        condition_.notify_one();
    }
    
    bool tryPop(std::string& item) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (queue_.empty()) {
            return false;
        }
        item = std::move(queue_.front());
        queue_.pop();
        return true;
    }
    
private:
    mutable std::mutex mutex_;
    std::queue<std::string> queue_;
    std::condition_variable condition_;
};
```

### Modern C++20 Features

```cpp
// Use concepts for better error messages
template<typename T>
concept Parseable = requires(T t, std::string_view input) {
    { t.parse(input) } -> std::convertible_to<bool>;
};

template<Parseable Parser>
void processInput(const Parser& parser, std::string_view input) {
    if (parser.parse(input)) {
        // Handle successful parse
    }
}

// Use ranges for expressive algorithms
auto validUrls = urls 
    | std::views::filter([](const auto& url) { return isValid(url); })
    | std::views::transform([](const auto& url) { return normalize(url); })
    | std::ranges::to<std::vector>();

// Use designated initializers for configuration
struct CrawlerConfig {
    int maxConcurrency = 10;
    std::chrono::milliseconds requestDelay{100};
    std::string userAgent = "CrawlZilla/1.0";
    bool respectRobotsTxt = true;
};

CrawlerConfig config{
    .maxConcurrency = 20,
    .requestDelay = std::chrono::milliseconds{50},
    .userAgent = "CrawlZilla/2.0"
};
```

## Testing Standards

### Unit Test Structure

```cpp
#include <gtest/gtest.h>
#include <gmock/gmock.h>

class UrlParserTest : public ::testing::Test {
protected:
    void SetUp() override {
        parser_ = std::make_unique<UrlParser>();
    }
    
    void TearDown() override {
        parser_.reset();
    }
    
    std::unique_ptr<UrlParser> parser_;
};

TEST_F(UrlParserTest, ParseValidHttpUrl) {
    // Arrange
    const std::string input = "https://example.com/path?query=value";
    
    // Act
    auto result = parser_->parse(input);
    
    // Assert
    ASSERT_TRUE(result.isSuccess());
    const auto& url = result.value();
    EXPECT_EQ(url.scheme(), "https");
    EXPECT_EQ(url.host(), "example.com");
    EXPECT_EQ(url.path(), "/path");
    EXPECT_EQ(url.query(), "query=value");
}

TEST_F(UrlParserTest, ParseInvalidUrlReturnsError) {
    // Arrange
    const std::string input = "not-a-url";
    
    // Act
    auto result = parser_->parse(input);
    
    // Assert
    EXPECT_FALSE(result.isSuccess());
    EXPECT_THAT(result.error(), ::testing::HasSubstr("invalid URL"));
}
```

### Mock Objects

```cpp
class MockHttpClient : public HttpClient {
public:
    MOCK_METHOD(HttpResponse, get, (const std::string& url), (override));
    MOCK_METHOD(HttpResponse, post, (const std::string& url, const std::string& data), (override));
    MOCK_METHOD(void, setUserAgent, (const std::string& userAgent), (override));
};

TEST(CrawlerEngineTest, HandleHttpError) {
    // Arrange
    auto mockClient = std::make_shared<MockHttpClient>();
    CrawlerEngine engine(mockClient);
    
    EXPECT_CALL(*mockClient, get("https://example.com"))
        .WillOnce(::testing::Return(HttpResponse{.status = 404}));
    
    // Act
    auto result = engine.crawl("https://example.com");
    
    // Assert
    EXPECT_FALSE(result.isSuccess());
}
```

## CMake Standards

### Directory Structure

```cmake
# CMakeLists.txt (root)
cmake_minimum_required(VERSION 3.20)
project(CrawlZilla VERSION 1.0.0 LANGUAGES CXX)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable compiler warnings
if(MSVC)
    add_compile_options(/W4 /WX)
else()
    add_compile_options(-Wall -Wextra -Wpedantic -Werror)
endif()

# Dependencies
find_package(CURL REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(GTest REQUIRED)

# Subdirectories
add_subdirectory(src)
add_subdirectory(tests)

# Testing
enable_testing()
```

### Library Definition

```cmake
# src/CMakeLists.txt
add_library(crawlzilla_core
    crawler/crawler_engine.cpp
    http/http_client.cpp
    url/url_parser.cpp
    content/content_processor.cpp
    storage/storage_manager.cpp
)

target_include_directories(crawlzilla_core
    PUBLIC 
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/../include>
        $<INSTALL_INTERFACE:include>
)

target_link_libraries(crawlzilla_core
    PUBLIC
        CURL::libcurl
        nlohmann_json::nlohmann_json
)

target_compile_features(crawlzilla_core PUBLIC cxx_std_20)
```

## Quality Gates

### Pre-commit Requirements
1. **Code Formatting**: clang-format with project style
2. **Static Analysis**: clang-tidy with strict warnings
3. **Unit Tests**: All tests pass with >90% coverage
4. **Documentation**: Public APIs documented
5. **Performance**: No performance regressions

### Continuous Integration
1. **Multi-platform**: Linux, macOS, Windows
2. **Multiple Compilers**: GCC, Clang, MSVC
3. **Sanitizers**: AddressSanitizer, ThreadSanitizer
4. **Security Scan**: Static analysis for vulnerabilities
5. **Benchmark**: Performance regression detection

### Code Review Checklist
- [ ] Follows naming conventions
- [ ] Memory safety patterns used
- [ ] Thread safety considered
- [ ] Error handling implemented
- [ ] Unit tests provided
- [ ] Documentation updated
- [ ] Performance impact assessed
- [ ] Security implications reviewed
