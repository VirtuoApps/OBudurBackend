# Cascading Delete Implementation for MongoDB

## Overview

This implementation provides cascading delete functionality for MongoDB in your NestJS application, similar to CASCADE in SQL databases. When a user is deleted, all related data is automatically deleted to maintain data integrity.

## What Gets Deleted

When a user is deleted, the following related data is automatically removed:

1. **Hotels** - All hotels where the user is the manager (`managerId` field)
2. **Favorites** - All favorite entries by the user (`userId` field)
3. **Saved Filters** - All saved search filters by the user (`userId` field)
4. **Hotel Messages** - All messages sent by the user (`senderUserId` field)

## Implementation Details

### Two Methods Available

#### 1. Simple Cascading Delete (Default)
```typescript
async remove(id: string): Promise<User>
```
- Performs cascading deletes sequentially
- Faster but less safe if system fails mid-operation
- Suitable for most use cases

#### 2. Transaction-Based Cascading Delete
```typescript
async removeWithTransaction(id: string): Promise<User>
```
- Uses MongoDB transactions for atomic operations
- All-or-nothing approach - if any operation fails, everything rolls back
- Recommended for production environments
- Requires MongoDB replica set or sharded cluster

### Usage

#### Using the Default Method
```typescript
// In your controller or service
const deletedUser = await this.usersService.remove(userId);
```

#### Using the Transaction Method
To use the safer transaction-based approach, you can either:

1. **Replace the current method** by renaming `removeWithTransaction` to `remove`
2. **Call it explicitly** in your controller:
```typescript
const deletedUser = await this.usersService.removeWithTransaction(userId);
```

### Error Handling

The implementation includes comprehensive error handling:

- **User Not Found**: Throws `NotFoundException` if user doesn't exist
- **Cascade Delete Failed**: Throws `BadRequestException` if any delete operation fails
- **Detailed Logging**: Console logs show exactly how many records were deleted

### Example Response Logs

```
Cascading delete completed for user 64a1b2c3d4e5f6789012345:
- Deleted 3 hotels
- Deleted 12 favorites
- Deleted 2 saved filters
- Deleted 8 hotel messages
```

## MongoDB vs SQL Comparison

### SQL (PostgreSQL) CASCADE Example
```sql
-- In SQL, you would define foreign keys with CASCADE
ALTER TABLE hotels 
ADD CONSTRAINT fk_manager 
FOREIGN KEY (manager_id) REFERENCES users(id) 
ON DELETE CASCADE;
```

### MongoDB (Our Implementation)
```typescript
// In MongoDB, we manually implement cascading logic
await this.hotelModel.deleteMany({ managerId: userObjectId });
await this.favoriteModel.deleteMany({ userId: id });
// ... etc
```

## Benefits of This Approach

1. **Data Integrity**: Prevents orphaned records
2. **Automatic Cleanup**: No manual cleanup required
3. **Transparent**: Clear logging of what was deleted
4. **Flexible**: Can be easily modified to add/remove collections
5. **Safe**: Transaction support for critical operations

## Performance Considerations

- The cascading delete may take time for users with many related records
- Consider implementing soft delete for better performance if needed
- Transaction version is slower but safer

## Alternative: Soft Delete

If you prefer soft delete instead of hard delete, you can modify the implementation to set a `deletedAt` timestamp instead of actually removing records:

```typescript
// Instead of deleteMany, use updateMany
await this.hotelModel.updateMany(
  { managerId: userObjectId },
  { deletedAt: new Date() }
);
```

## Testing the Implementation

To test the cascading delete:

1. Create a test user
2. Create some hotels, favorites, and saved filters for that user
3. Delete the user
4. Verify all related data is gone

```typescript
// Example test scenario
const testUser = await usersService.create(createUserDto);
const testHotel = await hotelService.create(createHotelDto, testUser._id);
await favoritesService.addFavorite(testUser._id, testHotel._id);

// Delete user - should remove hotel and favorite
await usersService.remove(testUser._id);

// Verify cleanup
const hotels = await hotelService.findAll({ managerId: testUser._id });
const favorites = await favoritesService.getUserFavorites(testUser._id);
// Both should be empty
```

## Security Note

Make sure to implement proper authorization before allowing user deletion, as this operation is irreversible and removes significant amounts of data.
