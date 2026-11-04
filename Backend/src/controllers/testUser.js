import  User from '../models/user.models.js';

const testUser = async (req, res) => {
  try {
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

const findTestUser = async (req, res) => {
    try {
        const {username, email, password} = req.body;
        
        const user = await User.findOne({ username, email, password });

        if(user) {
            res.status(200).json({ message: 'User found', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error finding user', error });
    }
};

const updateUser = async (req, res) => {
    try {
        const { _id, username } = req.body;

        const user = await User.findByIdAndUpdate(
            _id,
            { username },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating user"
        });
    }
};

const deleteUser = async (req, res) => {
    try{
        const { _id } = req.body;

        const user = findByIdAndDelete();

        if(!user){
            return res.status(401).json({message : "User Not Found"})
        }

        return res.status(200).json({message : "Deleted Sucessfull", user})

    }catch(error){
        return res.status(500).json({
            message: "Error updating user"});
    }
    
};

export { testUser, findTestUser };