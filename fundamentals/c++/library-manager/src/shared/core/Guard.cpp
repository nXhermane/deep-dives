#include "Guard.hpp"
namespace Core {
    GuardResponse Guard::isNegative(const int &value) { return GuardResponse(value < 0, "Value is negative"); }
    GuardResponse Guard::isNegative(const double &value) { return GuardResponse(value < 0.0, "Value is negative"); }
    GuardResponse Guard::combine(const GuardResponse *guardResponses, size_t size) {
        for (size_t i = 0; i < size; i++) {
            if (!guardResponses[i].succeeded) return guardResponses[i];
        }
        return GuardResponse(true, "All result passed");
    }
}  // namespace Core