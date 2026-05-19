def validateProjectName(name):
    return bool(name) and 1 <= len(name) <= 100

def validateProjectDescription(description):
    return bool(description)

def validateLat(lat):
    try:
        float(lat)
        return True
    except ValueError:
        return False

def validateLong(lon):
    try:
        float(lon)
        return True
    except ValueError:
        return False

def validateRadius(radius):
    try:
        radius = float(radius)
        return radius > 0
    except ValueError:
        return False
