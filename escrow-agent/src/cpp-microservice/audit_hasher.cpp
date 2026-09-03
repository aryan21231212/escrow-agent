#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>

// Function to compute SHA-256 hash for audit logs
std::string computeSHA256(const std::string& str) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char*)str.c_str(), str.size(), hash);

    std::stringstream ss;
    for(int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: ./audit_hasher \"payload_string_to_hash\"" << std::endl;
        return 1;
    }

    std::string inputPayload = argv[1];
    std::string hashedOutput = computeSHA256(inputPayload);

    // Output JSON format for easy parsing back into Next.js/Prisma
    std::cout << "{\"hash\": \"" << hashedOutput << "\"}" << std::endl;
    return 0;
}