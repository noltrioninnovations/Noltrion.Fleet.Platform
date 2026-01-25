namespace Noltrion.Framework.Shared.Enums
{
    public enum JobStatus
    {
        Received = 0,    // Initial state from Email/Form
        Validated = 10,  // Mandatory fields checked
        Planned = 20,    // Assigned to a Trip/Vehicle
        InTransit = 30,  // Driver started trip
        Arrived = 40,    // Vehicle at destination
        Delivered = 50,  // POD captured
        Verified = 60,   // POD Approved
        Cancelled = 99
    }

    public enum JobSource
    {
        Manual = 0,
        Email = 1,
        API = 2
    }
}
