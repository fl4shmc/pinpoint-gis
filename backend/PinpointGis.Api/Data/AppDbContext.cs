using Microsoft.EntityFrameworkCore;
using PinpointGis.Api.Models;

namespace PinpointGis.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<UserAccount> Users => Set<UserAccount>();

    public DbSet<Location> Locations => Set<Location>();

    public DbSet<FavoriteLocation> FavoriteLocations => Set<FavoriteLocation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserAccount>(entity =>
        {
            entity.ToTable("Users");
            entity.Property(x => x.Id).HasMaxLength(64).IsRequired();
            entity.Property(x => x.Username).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Email).HasMaxLength(255).IsRequired();
            entity.Property(x => x.PasswordHash).HasMaxLength(500).IsRequired();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<Location>(entity =>
        {
            entity.Property(x => x.Name).HasMaxLength(120).IsRequired();
            entity.Property(x => x.Description).HasMaxLength(500).IsRequired();
            entity.Property(x => x.Category).HasMaxLength(40).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.CreatedByUserId).HasMaxLength(120).IsRequired();
        });

        modelBuilder.Entity<FavoriteLocation>(entity =>
        {
            entity.HasIndex(x => new { x.UserId, x.LocationId }).IsUnique();
            entity.Property(x => x.UserId).HasMaxLength(120).IsRequired();
        });
    }
}
