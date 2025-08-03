using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApplication1.Migrations
{
    /// <inheritdoc />
    public partial class AddTherapistProfilePicture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfilePictureUrl",
                table: "Therapists",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TherapistId1",
                table: "Appointments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TherapistId1",
                table: "Appointments",
                column: "TherapistId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Therapists_TherapistId1",
                table: "Appointments",
                column: "TherapistId1",
                principalTable: "Therapists",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Therapists_TherapistId1",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_TherapistId1",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "ProfilePictureUrl",
                table: "Therapists");

            migrationBuilder.DropColumn(
                name: "TherapistId1",
                table: "Appointments");
        }
    }
}
