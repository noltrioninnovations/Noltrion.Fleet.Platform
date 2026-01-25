using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Noltrion.FleetX.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddJobRequestIdToTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "JobRequestId",
                table: "Trips",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JobRequestId",
                table: "Trips");
        }
    }
}
