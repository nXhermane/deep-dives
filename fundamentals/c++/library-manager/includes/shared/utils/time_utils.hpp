#pragma once
#include <chrono>
#include <string>
namespace Utils {
    constexpr auto TIME_FORMAT = "%Y-%m-%d %H:%M:%S";
    /**
     * @function : Function pour convertir un time point en string
     */
    std::string timePointToString(const std::chrono::system_clock::time_point& time_point);
    /**
     * Function pour convertir un string en time point
     */
    std::chrono::system_clock::time_point stringToTimePoint(const std::string& time_str);

}  // namespace Utils