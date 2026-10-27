#include <chrono>
#include <ctime>
#include <format>
#include <iomanip>
#include <sstream>
#include <stdexcept>
#include <string>

#include "shared/utils/time_utils.hpp"

namespace Utils {
    std::string timePointToString(const std::chrono::system_clock::time_point &time_point) {
        return std::format("{{:{}{}}}", TIME_FORMAT, time_point);
    }
    std::chrono::system_clock::time_point stringToTimePoint(const std::string &time_str) {
        std::istringstream iss(time_str);
        std::tm tm = {};
        iss >> std::get_time(&tm, TIME_FORMAT);
        if (iss.fail()) throw std::runtime_error("Error on parsing time.");
        return std::chrono::system_clock::from_time_t(std::mktime(&tm));
    }
}  // namespace Utils