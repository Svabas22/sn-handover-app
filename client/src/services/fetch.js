async function fetchUser() {
    try {
        const response = await fetch('/auth/user', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

module.exports = { fetchUser };